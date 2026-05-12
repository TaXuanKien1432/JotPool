import { useRef, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../services/api'
import type { Note } from '../pages/Home'

interface PendingChange {
    title?: string;
    body?: string;
}

export function useSaveQueue(setNotes: React.Dispatch<React.SetStateAction<Note[]>>) {
    // Map of noteId -> pending changes
    const pendingChanges = useRef<Map<string, PendingChange>>(new Map());
    // Map of noteId -> debounce timer
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    // Track saving state per note
    const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());

    // Save a specific note to the database
    const saveNote = useCallback(async (noteId: string) => {
        const changes = pendingChanges.current.get(noteId);
        if (!changes) return;

        try {
            await apiFetch(`/api/notes/${noteId}`, {
                method: "PUT",
                body: { title: changes.title, body: changes.body}
            });
            pendingChanges.current.delete(noteId);
        } catch (err) {
            console.error(`Failed to save note ${noteId}:`, err);
        } finally {
            if (!pendingChanges.current.has(noteId)) {
                setSavingNotes(prev => {
                    if (!prev.has(noteId)) return prev;
                    const next = new Set(prev);
                    next.delete(noteId);
                    return next;
                });
            }
        }
    }, []);

    // Queue a change for a note (called on every edit)
    const queueChange = useCallback((noteId: string, patch: PendingChange) => {
        // 1. Add to savingNotes
        setSavingNotes(prev => {
            if (prev.has(noteId)) return prev;
            const next = new Set(prev);
            next.add(noteId);
            return next;
        });
        
        // 2. Store pending change
        const existing = pendingChanges.current.get(noteId) ?? {};
        pendingChanges.current.set(noteId, { ...existing, ...patch});
        
        // 3. Update notes state immediately (optimistic UI)
        setNotes(prev => prev.map(note =>
            note.id === noteId ? { ...note, ...patch } : note
        ));

        // 4. Clear existing timer for this note
        const existingTimer = timers.current.get(noteId);
        if (existingTimer) clearTimeout(existingTimer);

        // 5. Start a new debounce timer
        const timer = setTimeout(() => {
            saveNote(noteId);
            timers.current.delete(noteId);
        }, 1000);

        timers.current.set(noteId, timer);
    }, [setSavingNotes, setNotes, saveNote]);

    // Check if any notes have unsaved changes
    const hasPendingChanges = useCallback(() => {
        return pendingChanges.current.size > 0;
    }, []);

    // Check if a specific note is saving
    const isSaving = useCallback((noteId: string) => {
        return savingNotes.has(noteId);
    }, [savingNotes]);

    // Warn user before leaving page with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (pendingChanges.current.size > 0) {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    useEffect(() => {
        return () => {
            timers.current.forEach(timer => clearTimeout(timer));
        };
    }, []);

    return { queueChange, hasPendingChanges, isSaving };
}