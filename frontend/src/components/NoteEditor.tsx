import { useContext, useMemo } from "react";
  import { useNavigate } from "react-router-dom";
  import type { Note } from "../pages/Home";
  import "@blocknote/core/fonts/inter.css";
  import "@blocknote/mantine/style.css";
  import { apiFetch } from "../services/api";
  import { UserContext } from "../contexts/UserContext";
  import userIdToColor from "../utils/color";
  import PrivateEditor from "./PrivateEditor";
  import CollabEditor from "./CollabEditor";

interface NoteEditorProps {
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNote: Note | null;
}

const NoteEditor = ({setNotes, selectedNote}: NoteEditorProps) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext)!;
  const collabUser = useMemo(() => (
    {
      name: user?.name ?? "Anonymous",
      color: userIdToColor(user?.id)
    }
  ), [user?.id, user?.name]);

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
        <div className="flex flex-col items-center justify-center h-screen w-full text-secondary">
          <h1 className="text-2xl font-semibold mb-4">Hello</h1>
          <p className="mb-6 text-center text-secondary">
            Choose a note from the sidebar or create a new one to start writing.
          </p>
          <button className="btn-primary" onClick={handleCreateNote}>
            Create New Note
          </button>
        </div>
      );
    }

    if (selectedNote.collaborative) {
      return (
        <CollabEditor
          key={selectedNote.id}
          selectedNote={selectedNote}
          setNotes={setNotes}
          user={collabUser}
        />
      );
    }

    return <PrivateEditor key={selectedNote.id} selectedNote={selectedNote} setNotes={setNotes} />;
  };

  export default NoteEditor;