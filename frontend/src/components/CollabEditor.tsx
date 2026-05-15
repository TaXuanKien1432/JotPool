import { useEffect, useMemo, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import type { Note } from "../pages/Home";
import NoteEditorTopBar from "./NoteEditorTopBar";
import CollabEditorBody from "./CollabEditorBody";

interface CollabEditorProps {
  selectedNote: Note;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  user: { name: string; color: string };
}

const CollabEditor = ({ selectedNote, setNotes, user }: CollabEditorProps) => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(() => new WebsocketProvider(
      import.meta.env.VITE_WS_BASE_URL,
      "notes/" + selectedNote.id,
      ydoc,
      { params: { token: localStorage.getItem("accessToken") ?? "" } }
  ), [selectedNote.id, ydoc]);
  const yTitle = useMemo(() => ydoc.getText("title"), [ydoc]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [title, setTitle] = useState(selectedNote.title);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
      const statusHandler = (event: { status: "connected" | "connecting" | "disconnected" }) => setStatus(event.status); 
      provider.on('status', statusHandler);
      if (provider.wsconnected) setStatus("connected");
      else if (provider.wsconnecting) setStatus("connecting");
      else setStatus("disconnected");
      
      const syncHandler = (state: boolean) => setSynced(state);
      provider.on('sync', syncHandler);
      if (provider.synced) setSynced(true);
      
      return () => {
        provider.off('status', statusHandler);
        provider.off('sync', syncHandler);
      }
}, [provider]);

  useEffect(() => {
      return () => {
          provider.destroy();
          ydoc.destroy();
      }
  }, [provider, ydoc])

  useEffect(() => {
      const obs = () => {
          const next = yTitle.toString();
          setTitle(next);
          setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title: next } : n));
      };
      yTitle.observe(obs);
      if (yTitle.length > 0) obs();
      return () => yTitle.unobserve(obs);
  }, [yTitle, setNotes, selectedNote.id]);

  const handleTitleChange = (newTitle: string) => {
      setTitle(newTitle);
      ydoc.transact(() => {
          yTitle.delete(0, yTitle.length);
          yTitle.insert(0, newTitle);
      })
  }

  return (
    <div className="flex flex-col h-screen w-full p-8 bg-white overflow-y-auto">
      <NoteEditorTopBar
        selectedNote={selectedNote}
        setNotes={setNotes}
        status={status}
      />
      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Untitled"
        className="text-2xl font-semibold border-none outline-none mb-4 w-full text-gray-800"
      />
      {synced ? (
        <CollabEditorBody ydoc={ydoc} provider={provider} user={user} />
      ) : (
        <div className="flex-1 p-4 min-h-[70vh]" />
      )}
    </div>
  );
};

export default CollabEditor;