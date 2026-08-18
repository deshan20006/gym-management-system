// app/dashboard/layout.tsx
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Notification Bell is added here */}
        <NotificationBell />
        {children}
      </main>
    </div>
  );
}