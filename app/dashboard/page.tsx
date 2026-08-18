// app/dashboard/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Helper function to format date as YYYY/MM/DD
function formatToYYYYMMDD(date: Date | string) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export default async function DashboardPage() {
  // Fetch total members count
  const totalMembers = await prisma.member.count();

  // Get today's start and end time to calculate today's revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysPayments = await prisma.payment.findMany({
    where: {
      paymentDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Calculate today's total revenue
  const todaysRevenue = todaysPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Get this month's start and end time to calculate this month's revenue
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthlyPayments = await prisma.payment.findMany({
    where: {
      paymentDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  // Calculate this month's total revenue
  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Fetch notifications to show expiring soon or urgent items
  const notifications = await prisma.notification.findMany({
    include: {
      payment: {
        include: {
          member: true,
        },
      },
    },
    orderBy: { triggeredAt: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here is a quick summary of your gym status.</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Members */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalMembers}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">Rs. {todaysRevenue.toString()}</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-full text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>

        {/* Card 3: This Month's Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">This Month's Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">Rs. {monthlyRevenue.toString()}</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-full text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
        </div>

        {/* Card 4: Pending Alerts / Expiring */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Expiring Alerts</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">{notifications.length}</h3>
          </div>
          <div className="bg-red-50 p-4 rounded-full text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
        </div>

      </div>

      {/* Recent Expiring/Renewal Alerts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Expiring Memberships & Alerts</h2>
        
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No membership expiry alerts right now.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => (
              <div key={notif.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {notif.payment.member.fullName} <span className="text-gray-500 font-normal">({notif.payment.member.phone})</span>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Membership expiring on: {formatToYYYYMMDD(notif.payment.expiryDate)}
                  </p>
                </div>
                
                <Link 
                  href={`/dashboard/members/${notif.payment.memberId}`}
                  className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                >
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