import { useContext, useEffect, useMemo, useState } from 'react'
import type { Note } from '../pages/Home'
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { apiFetch } from '../services/api';
import { useSaveQueue } from '../hooks/useSaveQueue';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus } from 'react-icons/fi';
import InvitePanel from './InvitePanel';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { UserContext } from '../contexts/UserContext';
import userIdToColor from '../utils/color';
import PrivateEditorBody from './PrivateEditorBody';
import CollabEditorBody from './CollabEditorBody';

interface NoteEditorProps {
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNote: Note | null;
}

const NoteEditor = ({setNotes, selectedNote}: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const { queueChange, isSaving } = useSaveQueue(setNotes);
  const inviteRef = useOutsideClick<HTMLDivElement>(showInvitePanel, () => setShowInvitePanel(false));
  const navigate = useNavigate();
  const { user } = useContext(UserContext)!;
  const collabUser = useMemo(() => (
    {
      name: user?.name ?? "Anonymous",
      color: userIdToColor(user?.id)
    }
  ), [user?.id, user?.name]);

  useEffect(() => {
    setTitle(selectedNote?.title ?? "");
  }, [selectedNote?.id])

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (selectedNote) {
      queueChange(selectedNote.id, { title: newTitle });
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await apiFetch<Note>("/api/notes", {method: "POST"});
      setNotes(prev => [newNote, ...prev]);
      navigate(`/home/${newNote.id}`);
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  }
  
  if (!selectedNote) {
    return (
      <div className='flex flex-col items-center justify-center h-screen w-full text-secondary'>
        <h1 className='text-2xl font-semibold mb-4'>Hello</h1>
        <p className='mb-6 text-center text-secondary'>
          Choose a note from the sidebar or create a new one to start writing.
        </p>
        <button className='btn-primary' onClick={handleCreateNote}>
          Create New Note
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen w-full p-8 bg-white overflow-y-auto'>
      {/* Top bar */}
      <div className='flex items-center justify-end mb-2 select-none'>
        <div ref={inviteRef} className='relative'>
          <button
            onClick={() => setShowInvitePanel((prev) => !prev)}
            className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 border
  border-gray-300 rounded-md hover:bg-gray-100'
          >
            <FiUserPlus className='w-4 h-4' />
            Share
          </button>
          <InvitePanel
            isOpen={showInvitePanel}
            onClose={() => setShowInvitePanel(false)}
            noteId={selectedNote.id}
            setNotes={setNotes}
          />
        </div>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder='Untitled'
        className='text-2xl font-semibold border-none outline-none mb-4 w-full text-gray-800'
      />

      {/* Editor body — branches on collaborative flag */}
      <div className='flex-1 p-4 min-h-[70vh]'>
        {selectedNote.collaborative ? (
          <CollabEditorBody
            key={selectedNote.id}
            noteId={selectedNote.id}
            user={collabUser}
          />
        ) : (
          <PrivateEditorBody
            key={selectedNote.id}
            noteId={selectedNote.id}
            initialBody={selectedNote.body}
            queueChange={queueChange}
          />
        )}
      </div>

      <div className='text-sm text-muted mt-2 text-right'>
        {isSaving(selectedNote.id) ? "Saving..." : "Saved"}
      </div>
    </div>
  );
}

export default NoteEditor