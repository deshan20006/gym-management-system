// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatToYYYYMMDD(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export default async function DashboardPage() {
  const totalMembers = await prisma.member.count();

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todaysPayments = await prisma.payment.findMany({ where: { paymentDate: { gte: todayStart, lte: todayEnd } } });
  const todaysRevenue = todaysPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthlyPayments = await prisma.payment.findMany({ where: { paymentDate: { gte: monthStart, lte: monthEnd } } });
  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const notifications = await prisma.notification.findMany({
    include: { payment: { include: { member: true } } }, orderBy: { triggeredAt: 'desc' }, take: 5,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Button in one line */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-4">
        
        {/* Dark Glass Box for Text Readability */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Welcome back, <span className="text-blue-400">Manuja!</span>
          </h1>
          <p className="text-gray-200 font-medium text-lg mt-2 drop-shadow-md">
            Here's what's happening with your gym today.
          </p>
        </div>
        
        {/* Button */}
        <Link 
          href="/dashboard/members/new"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500/50 flex items-center gap-2 z-10"
        >
          <span>+ Add New Member</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Members */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#5c40e8]/20 p-3.5 rounded-xl text-[#8b76ff] border border-[#5c40e8]/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            {/* Title text enlarged */}
            <p className="text-lg font-semibold text-gray-200">Total Members</p>
          </div>
          {/* Numbers enlarged and made fully white */}
          <h3 className="text-4xl font-bold text-white mt-5 ml-1">{totalMembers}</h3>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3.5 rounded-xl text-emerald-400 border border-emerald-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-lg font-semibold text-gray-200">Today's Revenue</p>
          </div>
          <h3 className="text-4xl font-bold text-white mt-5 ml-1">Rs. {todaysRevenue.toString()}</h3>
        </div>

        {/* This Month's Revenue */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3.5 rounded-xl text-blue-400 border border-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p className="text-lg font-semibold text-gray-200">This Month's Revenue</p>
          </div>
          <h3 className="text-4xl font-bold text-white mt-5 ml-1">Rs. {monthlyRevenue.toString()}</h3>
        </div>

        {/* Expiring Alerts */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-3.5 rounded-xl text-rose-400 border border-rose-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="text-lg font-semibold text-gray-200">Expiring Alerts</p>
          </div>
          <h3 className="text-4xl font-bold text-white mt-5 ml-1">{notifications.length}</h3>
        </div>
      </div>

      {/* Expiring Alerts Component */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Expiring Memberships & Alerts</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-300 text-base">No membership expiry alerts right now.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => (
              <div key={notif.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                <div>
                  <p className="text-base font-semibold text-white">
                    {notif.payment.member.fullName} <span className="text-gray-300 font-normal">({notif.payment.member.phone})</span>
                  </p>
                  <p className="text-sm text-red-400 mt-1">Membership expiring on: {formatToYYYYMMDD(notif.payment.expiryDate)}</p>
                </div>
                <Link href={`/dashboard/members/${notif.payment.memberId}`} className="text-sm bg-blue-600/80 text-white px-4 py-2 rounded-xl hover:bg-blue-500 font-bold transition shadow-md border border-blue-500/30">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}