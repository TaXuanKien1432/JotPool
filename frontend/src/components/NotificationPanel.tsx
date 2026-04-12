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
}: NotificationPanelProps) => {

  return (
    <aside className="w-80 h-screen bg-white border-r border-gray-300 flex flex-col absolute left-72 z-50 shadow-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">Notifications</h2>
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
        ) : notifications.length === 0 ? (
          <p className='text-sm text-gray-500 px-4 py-3'>
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""}`}
            >
              {renderNotification(n)}
              <p className='text-xs text-gray-400 mt-1'>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default NotificationPanel;
