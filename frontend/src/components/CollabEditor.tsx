import { useContext, useEffect, useMemo, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import type { Note } from "../pages/Home";
import NoteEditorTopBar from "./NoteEditorTopBar";
import CollabEditorBody from "./CollabEditorBody";
import { UserContext } from "../contexts/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

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
  const [authError, setAuthError] = useState<null | "expired" | "denied">(null);
  const { setUser } = useContext(UserContext)!;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Need both, provider.on('status') for future status changes, manual check for one-time reconciliation of current status 
    const statusHandler = (event: { status: "connected" | "connecting" | "disconnected" }) => setStatus(event.status); 
    provider.on('status', statusHandler);
    if (provider.wsconnected) setStatus("connected");
    else if (provider.wsconnecting) setStatus("connecting");
    else setStatus("disconnected");
    
    // Need both, provider.on('sync') for future sync changes, manual check for one-time reconciliation of current sync state
    const syncHandler = (state: boolean) => setSynced(state);
    provider.on('sync', syncHandler);
    if (provider.synced) setSynced(true);

    const closeHandler = (event: CloseEvent | null) => {
      if (!event) return;
      if (event.code === 4401 || event.code === 4403) {
        provider.shouldConnect = false;
        setAuthError(event.code === 4401 ? "expired" : "denied");
      }
    };
    provider.on('connection-close', closeHandler);
    
    return () => {
      provider.off('status', statusHandler);
      provider.off('sync', syncHandler);
      provider.off('connection-close', closeHandler);
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

  if (authError) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-white p-8">
        <div className="max-w-md w-full text-center border border-gray-200 rounded-lg p-8">
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
              authError === "expired" ? "bg-blue-50 text-jotpool" : "bg-red-50 text-red-500"
            }`}
          >
            {authError === "expired" ? "\u26A0" : "\u{1F512}"}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {authError === "expired" ? "Your session expired" : "No access to this note"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {authError === "expired"
              ? "You were disconnected because your sign-in is no longer valid. Please log in again to keep editing."
              : "You no longer have permission to view or edit this note. It may have been unshared by the owner."}
          </p>
          {authError === "expired" ? (
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                setUser(null);
                navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
              }}
              className="btn-primary w-full"
            >
              Log in again
            </button>
          ) : (
            <button onClick={() => navigate("/")} className="btn-primary w-full">
              Back to my notes
            </button>
          )}
        </div>
      </div>
    );
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