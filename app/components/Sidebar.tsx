// app/components/Sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react"; // Assuming you're using next-auth

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button (Only visible on mobile) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-4 text-slate-800 focus:outline-none"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-64 h-full bg-slate-900 text-white flex flex-col shadow-lg transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-400">FITNESS PRO</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-slate-800">Dashboard</Link>
          <Link href="/dashboard/members" className="block px-4 py-3 rounded-lg hover:bg-slate-800">Members</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
           {/* Replace this with a client-side logout if needed */}
           <button onClick={() => console.log("Logout clicked")} className="w-full px-4 py-2 bg-red-600 rounded-lg">Logout</button>
        </div>
      </aside>
    </>
  );
}