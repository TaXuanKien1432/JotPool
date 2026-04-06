interface ConfirmationPopupProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationPopup = ({isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel}: ConfirmationPopupProps) => {
    if (!isOpen) return null;
    return (
        <div className='modal-overlay'>
            <div className='modal-content w-80'>
                <h2 className='text-lg font-semibold mb-2 text-primary'>{title}</h2>
                <p className='text-sm text-secondary mb-5'>{message}</p>
                <div className='flex justify-end gap-3'>
                    <button
                        onClick={onCancel}
                        className='btn-secondary'
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className='btn-danger'
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationPopup