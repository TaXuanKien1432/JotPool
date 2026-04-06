import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'
import { useParams } from 'react-router-dom';

export interface Note {
  id: string;
  title: string;
  body: string;
  collaborative: boolean;
  createdAt: string;
  updatedAt: string;
}

const Home:React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const { noteId } = useParams();  
  
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) setSelectedNote(note);
    } else {
      setSelectedNote(null);
    }
  }, [notes, noteId]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        notes={notes}
        setNotes={setNotes}
        selectedNote={selectedNote}/>
      <NoteEditor 
        notes={notes}
        setNotes={setNotes}
        selectedNote={selectedNote}/>
    </div>
  )
}

export default Home