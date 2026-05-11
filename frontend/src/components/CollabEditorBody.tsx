import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

interface CollabEditorBodyProps {
    noteId: string;
    user: { name: string; color: string };
}

const CollabEditorBody = ({ noteId, user }: CollabEditorBodyProps) => {
  return (
    <div>Collab editor loading...</div>
  )
}

export default CollabEditorBody