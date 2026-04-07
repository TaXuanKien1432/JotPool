import { useContext, useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import defaultAvatar from '../assets/default-avatar.svg';
import { UserContext } from '../contexts/UserContext';
import type { Note } from '../pages/Home';

interface InvitePanelProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

interface Collaborator {
  userId: string;
  name: string;
  email: string;
  profilePicture: string;
  role: "VIEWER" | "EDITOR";
}

const InvitePanel = ({ isOpen, onClose, noteId, setNotes }: InvitePanelProps) => {
  const { user } = useContext(UserContext)!;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [submitting, setSubmitting] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const fetchCollaborators = async () => {
    try {
      const data = await apiFetch<Collaborator[]>(`/api/notes/${noteId}/collaborators`, { method: "GET" });
      setCollaborators(data);
    } catch (err) {
      console.error("Failed to fetch collaborators:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchCollaborators();
  }, [noteId, isOpen]);

  const handleInvite = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/api/notes/${noteId}/invite`, { method: "POST", body: { email, role } });
      setEmail("");
      setRole("VIEWER");
      fetchCollaborators();
      setNotes((prev) => 
        prev.map((n) => (n.id === noteId ? {...n, collaborative: true} : n))
      );
    } catch (err) {
      console.error("Failed to invite:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      await apiFetch(`/api/notes/${noteId}/collaborators/${collaboratorId}`, { method: "DELETE" });
      const isSelf = collaboratorId === user?.id;
      if (isSelf) {
        // user removed themselves -> "leave note"
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        onClose();
        navigate("/home");
      } else {
        const remaining = collaborators.filter((c) => c.userId !== collaboratorId);
        setCollaborators(remaining);
        if (remaining.length === 0) {
          setNotes((prev) =>
            prev.map((n) => (n.id === noteId ? {...n, collaborative: false} : n))
          );
        }
      }
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Invite collaborators</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Invite form */}
      <div className="flex items-center gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email address"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-gray-500"
        />
        <select
          value={role}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "VIEWER" || value === "EDITOR") setRole(value);
          }}
          className="px-2 py-2 text-sm border border-gray-300 rounded-md outline-none bg-white focus:border-gray-500"
        >
          <option value="VIEWER">Viewer</option>
          <option value="EDITOR">Editor</option>
        </select>
        <button
          onClick={handleInvite}
          disabled={submitting}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
        >
          Invite
        </button>
      </div>

      {/* Current collaborators list */}
      <div className="mt-4 border-t border-gray-200 pt-3">
        <p className="text-xs font-medium text-gray-500 mb-2">People with access</p>
        <div className="flex flex-col gap-2">
          {collaborators.length === 0 ? (
            <p className="text-xs text-gray-400">No collaborators yet</p>
          ) : (
            collaborators.map((c) => (
              <div key={c.userId} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={c.profilePicture || defaultAvatar}
                    alt={c.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate">{c.name}</span>
                    <span className="text-xs text-gray-500 truncate">{c.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">{c.role}</span>
                  <button
                    onClick={() => handleRemove(c.userId)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitePanel;
