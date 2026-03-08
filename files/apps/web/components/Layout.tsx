import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-16 flex items-center justify-between px-8 bg-white shadow">
          <NotificationDropdown />
        </div>
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}