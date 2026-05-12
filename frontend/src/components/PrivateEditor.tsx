import { useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { Note } from "../pages/Home";
import { useSaveQueue } from "../hooks/useSaveQueue";
import NoteEditorTopBar from "./NoteEditorTopBar";

interface PrivateEditorProps {
    selectedNote: Note;
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const PrivateEditor = ({ selectedNote, setNotes }: PrivateEditorProps) => {
    const { queueChange, isSaving } = useSaveQueue(setNotes);
    const [title, setTitle] = useState(selectedNote.title);
    const editor = useCreateBlockNote({
        initialContent: (() => {
            if (!selectedNote.body) return undefined;
            const parsed = JSON.parse(selectedNote.body);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
        })()
    });

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        queueChange(selectedNote.id, { title: newTitle });
    };

    const handleBodyChange = (newBody: string) => {
        queueChange(selectedNote.id, { body: newBody });
    };
    
    return (
      <div className="flex flex-col h-screen w-full p-8 bg-white overflow-y-auto">
        <NoteEditorTopBar
          selectedNote={selectedNote}
          setNotes={setNotes}
          isSaving={isSaving(selectedNote.id)}
        />
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="text-2xl font-semibold border-none outline-none mb-4 w-full text-gray-800"
        />
        <div className="flex-1 p-4 min-h-[70vh]">
          <BlockNoteView
            editor={editor}
            onChange={(editor) => handleBodyChange(JSON.stringify(editor.document))}
          />
        </div>
      </div>
    );
};

export default PrivateEditor;