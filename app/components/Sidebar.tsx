// app/components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Members", href: "/dashboard/members" },
  ];

  return (
    <>
      {/* Hamburger Button (Only visible on mobile) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 text-white bg-black/40 rounded-lg backdrop-blur-md border border-white/10 focus:outline-none shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}/>
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-72 h-screen bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div>
          {/* Logo & Gym Name Section */}
          <div className="flex items-center gap-3 mb-10 px-1 mt-12 md:mt-0">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black/10 bg-white flex items-center justify-center shadow-lg shrink-0">
              <img 
                src="/logo.jpeg" 
                alt="MR.FITNESS GYM Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-black font-black text-sm">MR</span>';
                }}
              />
            </div>
            
            <h1 
              className="text-black text-[22px] tracking-tight uppercase whitespace-nowrap leading-none"
              style={{ 
                fontFamily: 'Impact, "Arial Black", sans-serif',
                transform: 'scaleY(1.1)',
                transformOrigin: 'left'
              }}
            >
              MR.FITNESS GYM
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm transition duration-300 ${
                    isActive
                      // Active Theme: ඔයාගේ පරණ ලස්සන Gradient එක, ඒත් අකුරු කළු සහ ඝනකම් කරලා
                      ? "font-bold bg-gradient-to-r from-blue-600/40 to-indigo-600/40 border border-blue-500/30 text-black shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      // Inactive Theme: අකුරු කළු සහ ඝනකම්
                      : "font-bold text-black hover:bg-black/10 border border-transparent"
                  }`}
                >
                  {link.name === "Dashboard" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Only */}
        <div className="space-y-3">
          <form action="/api/auth/signout" method="POST">
            {/* Logout Button: ඔයා ඉල්ලපු පරණ විදිහටම වෙනස් කළා */}
            <button type="submit" className="w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-red-300 bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 transition flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}