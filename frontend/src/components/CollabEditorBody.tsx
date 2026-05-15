import { useCreateBlockNote } from "@blocknote/react"
import type { WebsocketProvider } from "y-websocket"
import type { Doc } from "yjs";
import { BlockNoteView } from "@blocknote/mantine";

interface CollabEditorBodyProps {
    ydoc: Doc;
    provider: WebsocketProvider;
    user: { name: string; color: string }
}

const CollabEditorBody = ({ ydoc, provider, user }: CollabEditorBodyProps) => {
    const editor = useCreateBlockNote({
        collaboration: {
            provider,
            fragment: ydoc.getXmlFragment("body"),
            user
        }
    })
  
    return (
        <div className="flex-1 p-4 min-h-[70vh]">
          <BlockNoteView editor={editor} />
        </div>
    )
}

export default CollabEditorBody