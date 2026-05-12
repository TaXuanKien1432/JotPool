import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useMemo, useState, useEffect } from "react";
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

interface CollabEditorBodyProps {
    noteId: string;
    user: { name: string; color: string };
}

const CollabEditorBody = ({ noteId, user }: CollabEditorBodyProps) => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const provider = useMemo(() => new WebsocketProvider(
    import.meta.env.VITE_WS_BASE_URL,
    "notes/" + noteId,
    ydoc,
    { params: { token: localStorage.getItem("accessToken") ?? "" } }
  ), [noteId, ydoc]);

  useEffect(() => {
    const handler = (event: { status: "connected" | "connecting" | "disconnected" }) => setStatus(event.status); 
    provider.on('status', handler);
    if (provider.wsconnected) setStatus("connected");
    else if (provider.wsconnecting) setStatus("connecting");
    else setStatus("disconnected");
    return () => provider.off('status', handler);
  }, [provider])

  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    }
  }, [provider, ydoc])

  const collabEditor = useCreateBlockNote({
    collaboration: { provider, fragment: ydoc.getXmlFragment("document-store"), user }
  })
  
  return (
    <div className="relative h-full">
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
        {status === "connected" ? "Live" : status === "connecting" ? "Connecting…" : "Disconnected"}
      </div>
      <BlockNoteView editor={collabEditor} />
    </div>
  );
}

export default CollabEditorBody