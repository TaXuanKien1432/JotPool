import type { Notification } from "./Sidebar";

interface CollaboratorAddedPayload {
  noteId: string;
  noteTitle: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
}

export type Filter = "unread" | "all";

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  toggleReadStatus: (notificationId: string, currentlyRead: boolean) => void;
  markAllAsRead: () => void;
}

const renderNotification = (notification: Notification) => {
  try {
    if (notification.type === "COLLABORATOR_ADDED") {
      const data: CollaboratorAddedPayload = JSON.parse(notification.payload);
      return (
        <>
          <p className='text-sm text-gray-800'>
            <span className='font-medium'>{data.inviterName}</span> added you to{" "}
            <span className='font-medium'>"{data.noteTitle || "Untitled"}"</span> as{" "}
            <span className='capitalize font-medium'>{data.role}</span>
          </p>
          <p className='text-xs text-gray-500 mt-1'>{data.inviterEmail}</p>
        </>
      );
    }
    return <p className='text-sm text-gray-800 break-words'>{notification.payload}</p>;
  } catch {
    return <p className='text-sm text-gray-800 break-words'>{notification.payload}</p>;
  }
};

const NotificationPanel = ({
  notifications,
  loading,
  filter,
  setFilter,
  toggleReadStatus,
  markAllAsRead,
}: NotificationPanelProps) => {
  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <aside className="w-80 h-screen bg-white border-r border-gray-300 flex flex-col fixed top-0 left-72 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setFilter("unread")}
          className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
            filter === "unread"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
            filter === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className='text-sm text-gray-500 px-4 py-3'>Loading notifications...</p>
        ) : filtered.length === 0 ? (
          <p className='text-sm text-gray-500 px-4 py-3'>
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.read ? "bg-blue-50" : ""}`}
              onClick={() => !n.read && toggleReadStatus(n.id, n.read)}
            >
              {renderNotification(n)}
              <div className="flex items-center justify-between mt-1">
                <p className='text-xs text-gray-400'>{new Date(n.createdAt).toLocaleString()}</p>
                <button
                  onClick={() => toggleReadStatus(n.id, n.read)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {n.read ? "Mark as unread" : "Mark as read"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default NotificationPanel;
