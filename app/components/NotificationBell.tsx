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
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus:outline-none"
      >
        {/* Thick & Bold Bell Icon matching your screenshot */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" /* ඝනකම වැඩි කළා */
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* Unread Count Badge (Glowing Red Dot) */}
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#1e1e24] shadow-[0_0_8px_rgba(239,68,68,0.8)] translate-x-1/4 -translate-y-1/4">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu (Glassmorphism Style) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-card bg-[#141418]/95 border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-[70] backdrop-blur-2xl">
          <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-white">Notifications</h3>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full font-medium">
              {notifications.length} New
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No new notifications right now.
              </div>
            ) : (
              notifications.map((notif: any) => {
                const memberName = notif.payment.member.fullName;
                const phone = notif.payment.member.phone;
                const expiryDate = formatDate(notif.payment.expiryDate);

                // Construct the polite English reminder message
                const reminderMessage = `Hi ${memberName},\n\nThis is a friendly reminder from MR.FITNESS GYM. Your monthly gym membership is due for renewal in 2 days (on ${expiryDate}).\n\nThank you for being a valued member!`;
                
                // Generate the direct WhatsApp Link
                const waLink = buildWhatsAppLink(phone, reminderMessage);

                return (
                  <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      <span className="font-semibold text-purple-400">{memberName}</span>'s payment is expiring in 2 days!
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      {/* Send WhatsApp Reminder Button */}
                      <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-2 rounded-lg hover:bg-green-500/30 font-medium transition text-center flex items-center justify-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        Send WhatsApp Reminder
                      </a>

                      <div className="flex gap-2">
                        <Link 
                          href={`/dashboard/members/${notif.payment.memberId}`} 
                          className="text-xs bg-[#5c40e8]/80 text-white px-3 py-1.5 rounded-lg hover:bg-[#5c40e8] font-medium transition flex-1 text-center"
                          onClick={() => setIsOpen(false)}
                        >
                          View Profile
                        </Link>
                        <button 
                          onClick={() => dismissNotification(notif.id)} 
                          className="text-xs bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white font-medium transition flex-1"
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
  );
}