// app/dashboard/layout.tsx
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden text-gray-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        
        {/* Top Bar for Notification Bell - වෙනම තීරුවක් */}
        <div className="w-full flex justify-end px-4 md:px-8 pt-6 pb-2 z-50">
          <NotificationBell />
        </div>
        
        {/* Main Content Area */}
        <div className="px-4 md:px-8 pb-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}