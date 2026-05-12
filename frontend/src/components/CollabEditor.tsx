import { useEffect, useMemo, useState } from "react";
  import { BlockNoteView } from "@blocknote/mantine";
  import { useCreateBlockNote } from "@blocknote/react";
  import { WebsocketProvider } from "y-websocket";
  import * as Y from "yjs";
  import type { Note } from "../pages/Home";
  import NoteEditorTopBar from "./NoteEditorTopBar";

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

    useEffect(() => {
        const handler = (event: { status: "connected" | "connecting" | "disconnected" }) => setStatus(event.status); 
        provider.on('status', handler);
        if (provider.wsconnected) setStatus("connected");
        else if (provider.wsconnecting) setStatus("connecting");
        else setStatus("disconnected");
        return () => provider.off('status', handler);
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
        if (yTitle.length > 0) obs(); // catch up only if there's something to catch up to; otherwise keep selectedNote.title fallback
        return () => yTitle.unobserve(obs);
    }, [yTitle, setNotes, selectedNote.id]);

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        ydoc.transact(() => {
            yTitle.delete(0, yTitle.length);
            yTitle.insert(0, newTitle);
        })
    }

    const editor = useCreateBlockNote({
        collaboration: {
            provider,
            fragment: ydoc.getXmlFragment("body"),
            user
        }
    });

    return (
      <div className="flex flex-col h-screen w-full p-8 bg-white overflow-y-auto">
        <NoteEditorTopBar
          selectedNote={selectedNote}
          setNotes={setNotes}
        />
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="text-2xl font-semibold border-none outline-none mb-4 w-full text-gray-800"
        />
        <div className="relative flex-1 p-4 min-h-[70vh]">
          <div
            className={
              "absolute top-0 right-0 z-10 px-2 py-0.5 text-xs font-medium rounded-full " +
              (status === "connected"
                ? "bg-green-100 text-green-700"
                : status === "connecting"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700")
            }
          >
            {status === "connected" ? "Live" : status === "connecting" ? "Connecting…" :
  "Disconnected"}
          </div>
          <BlockNoteView editor={editor} />
        </div>
      </div>
    );
  };

  export default CollabEditor;