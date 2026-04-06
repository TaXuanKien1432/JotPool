import React from 'react'
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineInfoCircle, AiOutlineWarning } from 'react-icons/ai'

type PopupType = "error" | "success" | "info" | "warning";

interface PopupProps {
  message: string;
  type?: PopupType;
  onClose: () => void;
}

const iconMap: Record<PopupType, { icon: React.ReactNode; color: string }> = {
  error:   { icon: <AiOutlineCloseCircle />, color: "text-red-500" },
  success: { icon: <AiOutlineCheckCircle />, color: "text-green-500" },
  info:    { icon: <AiOutlineInfoCircle />, color: "text-blue-500" },
  warning: { icon: <AiOutlineWarning />, color: "text-yellow-500" },
};

const Popup: React.FC<PopupProps> = ({ message, type = "error", onClose }) => {
  const { icon, color } = iconMap[type];

  return (
    <div className='modal-overlay'>
      <div className='modal-content w-80'>
        <div className='flex items-start gap-3 mb-4'>
          <span className={`text-2xl flex-shrink-0 ${color}`}>{icon}</span>
          <p className='text-sm text-primary'>{message}</p>
        </div>
        <div className='flex justify-end'>
          <button className='btn-secondary' onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default Popup