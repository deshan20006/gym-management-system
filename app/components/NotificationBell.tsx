// app/components/NotificationBell.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications from the database
  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dismiss notification and remove from UI
  const dismissNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
  };

  // Helper to format the expiry date
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-6 right-8 z-50">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-white p-3 rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 transition relative flex items-center justify-center"
        >
          {/* Bell Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          
          {/* Unread Count Badge */}
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {notifications.length}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                {notifications.length} New
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No new notifications right now.
                </div>
              ) : (
                notifications.map((notif: any) => {
                  const memberName = notif.payment.member.fullName;
                  const phone = notif.payment.member.phone;
                  const expiryDate = formatDate(notif.payment.expiryDate);

                  // Construct the polite English reminder message
                  const reminderMessage = `Hi ${memberName},\n\nThis is a friendly reminder from FITNESS PRO. Your monthly gym membership is due for renewal in 2 days (on ${expiryDate}).\n\nThank you for being a valued member!`;
                  
                  // Generate the direct WhatsApp Link
                  const waLink = buildWhatsAppLink(phone, reminderMessage);

                  return (
                    <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition">
                      <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                        <span className="font-semibold text-blue-600">{memberName}</span>'s payment is expiring in 2 days!
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        {/* Send WhatsApp Reminder Button (Full Width) */}
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-100 font-medium transition text-center"
                        >
                          Send WhatsApp Reminder
                        </a>

                        <div className="flex gap-2">
                          <Link 
                            href={`/dashboard/members/${notif.payment.memberId}`} 
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition flex-1 text-center"
                            onClick={() => setIsOpen(false)}
                          >
                            View Profile
                          </Link>
                          <button 
                            onClick={() => dismissNotification(notif.id)} 
                            className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium transition flex-1"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}