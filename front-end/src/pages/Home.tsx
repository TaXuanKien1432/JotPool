import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

const Home:React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        notes={notes}
        setNotes={setNotes}
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}/>
      <NoteEditor 
        notes={notes}
        setNotes={setNotes}
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}/>
    </div>
  )
}

export default Home