import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import InvitePanel from "./InvitePanel";
import { useOutsideClick } from "../hooks/useOutsideClick";
import type { Note } from "../pages/Home";

interface NoteEditorTopBarProps {
    selectedNote: Note;
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    isSaving?: boolean;
    status?: "connecting" | "connected" | "disconnected";
}

const NoteEditorTopBar = ({ selectedNote, setNotes, isSaving, status }: NoteEditorTopBarProps) => {
    const [showInvitePanel, setShowInvitePanel] = useState(false);
    const inviteRef = useOutsideClick<HTMLDivElement>(showInvitePanel, () => setShowInvitePanel(false));

    return (
        <div className="flex items-center justify-end gap-3 mb-2 select-none">
            {isSaving !== undefined && (
                <span className="text-sm text-muted">
                    {isSaving ? "Saving..." : "Saved"}
                </span>
            )}
            {status !== undefined && (
                <span
                    className={
                        "px-2 py-0.5 text-xs font-medium rounded-full " +
                        (status === "connected"
                            ? "bg-green-100 text-green-700"
                            : status === "connecting"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700")
                    }
                >
                    {status === "connected" ? "Live" : status === "connecting" ? "Connecting…" : "Disconnected"}
                </span>
            )}
            <div ref={inviteRef} className="relative">
                <button
                    onClick={() => setShowInvitePanel((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 border
        border-gray-300 rounded-md hover:bg-gray-100"
                >
                    <FiUserPlus className="w-4 h-4" />
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
    );
};

export default NoteEditorTopBar;