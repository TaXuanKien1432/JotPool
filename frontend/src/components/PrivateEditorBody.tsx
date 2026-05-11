import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";


interface PrivateEditorBodyProps {
    noteId: string;
    initialBody: string;
    queueChange: (noteId: string, patch: { title?: string; body?: string }) => void;
}

const PrivateEditorBody = ({ noteId, initialBody, queueChange }: PrivateEditorBodyProps) => {
    const privateEditor = useCreateBlockNote({
        initialContent: (() => {
            if (!initialBody) return undefined;
            const parsed = JSON.parse(initialBody);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
        })(),
    });
    
    const handleBodyChange = (newBody: string) => {
        queueChange(noteId, { body: newBody });
    };
    
    return (
        <BlockNoteView 
            editor={privateEditor} 
            onChange={editor => handleBodyChange(JSON.stringify(editor.document))}
        />
    )
}

export default PrivateEditorBody
