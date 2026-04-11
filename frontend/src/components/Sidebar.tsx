import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.svg'
import { AiOutlineHome, AiOutlinePlus } from "react-icons/ai";
import { BiLock } from 'react-icons/bi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { apiFetch } from '../services/api';
import { UserContext } from '../contexts/UserContext';
import type { Note } from '../pages/Home';
import { FiFileText, FiTrash2 } from 'react-icons/fi';
import ConfirmationPopup from './ConfirmationPopup';
import { useOutsideClick } from '../hooks/useOutsideClick';

interface SidebarProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNote: Note | null;
}

const Sidebar = ({notes, setNotes, selectedNote}: SidebarProps) => {
  
  const [loading, setLoading] = useState(true);
  const {user, setUser} = useContext(UserContext)!;
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = 0;
  const menuRef = useOutsideClick<HTMLDivElement>(showMenu, () => setShowMenu(false));
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes(); 
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Note[]>("/api/notes", { method: "GET" });
      setNotes(data);
    } catch(err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/");
  };

  const handleAddNote = async () => {
    try {
      const newNote = await apiFetch<Note>("/api/notes", {method: "POST"});
      setNotes((prev) => [newNote, ...prev]);
      navigate(`/home/${newNote.id}`);
    } catch(err) {
      console.error("Failed to create note:", err);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await apiFetch(`/api/notes/${noteToDelete.id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((note) => note.id !== noteToDelete.id));
      if (selectedNote?.id === noteToDelete.id) navigate("/home");
    } catch(err) {
      console.error("Failed to delete note:", err);
    } finally {
      setShowConfirm(false);
      setNoteToDelete(null);
    }
  }

  return (
    <aside className="w-72 h-screen bg-gray-100 border-r border-gray-300 flex flex-col flex-shrink-0 p-2">
      {/* USER PROFILE */}
      <div className="relative" ref={menuRef}>
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-200 rounded-md p-2 mb-2"
          onClick={() => setShowMenu((prev) => !prev)}>
            <img src={user?.profilePicture || defaultAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = defaultAvatar; }} />
            <div>{user?.name || "User"}</div>
        </div>
        {showMenu && (
          <div className="absolute top-12 left-0 w-80 bg-white shadow-md border border-gray-200 rounded-lg p-2 z-10">
            <div className="flex gap-3 border-b pb-2 border-gray-300">
              <img src={user?.profilePicture || defaultAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = defaultAvatar; }} />
              <div className="flex flex-col">
                <p className="font-semibold text-sm">{user?.name || "User"}</p>
                <p className="text-gray-500 font-medium text-sm">{user?.email || ""}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowConfirm(true)} 
              className='w-full text-left text-gray-500 font-medium hover:bg-gray-100 rounded-md p-2 mt-2'>Logout</button>
          </div>
        )}
      </div>

      {/* HOME NAV */}
      <div 
        className={`flex items-center gap-3 p-3 cursor-pointer rounded-md hover:bg-gray-200 ${!selectedNote ? "bg-gray-200" : ""}`}
        onClick={() => {
          navigate("/home");
        }}
      >
        <AiOutlineHome className='text-gray-700 w-5 h-5'/>
        <span className='text-gray-700 text-sm'>Home</span>
      </div>

      {/* NOTES */}
      <div className='flex-1 overflow-y-auto mt-2'>
        {loading ? (
          <p className='text-md text-secondary px-3 py-2'>Loading notes...</p>
        ) : (
          <>
            {/* PRIVATE NOTES */}
            <div className='flex items-center gap-2 px-3 py-2 text-gray-700 text-sm font-medium border-t border-gray-300'>
              <BiLock className='w-4 h-4' />
              <span>Private Notes</span>
            </div>

            {notes.filter((note) => !note.collaborative).map((note) => (
              <div
                key={note.id}
                className={`group flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-500 cursor-pointer rounded-md ${
                selectedNote?.id === note.id ? "bg-gray-200" : "hover:bg-gray-200"}`}
              >
                <FiFileText className='text-gray-500 w-5 h-5'/>
                <span
                  className='flex-1 truncate'
                  onClick={() => {
                    navigate(`/home/${note.id}`);
                  }}
                >
                  {note.title.trim() || "Untitled"}
                </span>
                <FiTrash2 onClick={(e) => {
                  e.stopPropagation;
                  setNoteToDelete(note);
                  setShowConfirm(true);
                }} className='hidden group-hover:block text-gray-500 hover:text-red-600 w-4 h-4 flex-shrink-0'/>
              </div>
            ))}

            <div
              onClick={handleAddNote}
              className="flex items-center gap-2 px-3 py-2 mt-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-200">
              <AiOutlinePlus className='w-5 h-5 text-gray-500' />
              <span>Add New</span>
            </div>

            {/* COLLABORATIVE NOTES */}
            <div className='flex items-center gap-2 px-3 py-2 mt-2 text-gray-700 text-sm font-medium border-t border-gray-300'>
              <HiOutlineUserGroup className='w-4 h-4' />
              <span>Collaborative Notes</span>
            </div>

            {notes.filter((note) => note.collaborative).map((note) => (
              <div
                key={note.id}
                className={`group flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-500 cursor-pointer rounded-md ${
                selectedNote?.id === note.id ? "bg-gray-200" : "hover:bg-gray-200"}`}
              >
                <FiFileText className='text-gray-500 w-5 h-5'/>
                <span
                  className='flex-1 truncate'
                  onClick={() => {
                    navigate(`/home/${note.id}`);
                  }}
                >
                  {note.title.trim() || "Untitled"}
                </span>
                <FiTrash2 onClick={(e) => {
                  e.stopPropagation;
                  setNoteToDelete(note);
                  setShowConfirm(true);
                }} className='hidden group-hover:block text-gray-500 hover:text-red-600 w-4 h-4 flex-shrink-0'/>
              </div>
            ))}
          </>
        )}
      </div>
      
      <ConfirmationPopup 
        isOpen={showConfirm}
        title={noteToDelete ? "Delete Node" : "Logout"}
        message={noteToDelete ? "Are you sure you want to delete this note?" : "Are you sure you want to logout?"}
        confirmLabel={noteToDelete ? "Delete" : "Logout"}
        cancelLabel='Cancel'
        onConfirm={noteToDelete ? handleDeleteNote : handleLogout}
        onCancel={() => {
          setShowConfirm(false);
          setNoteToDelete(null);
        }}
        />
      
    </aside>
  );
}

export default Sidebar