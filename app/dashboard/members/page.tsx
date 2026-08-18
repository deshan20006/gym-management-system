// app/dashboard/members/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Next.js Server Component to display the list of gym members
export default async function MembersPage() {
  // Fetch all members from the database
  const members = await prisma.member.findMany();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gym Members</h1>
        <Link 
          href="/dashboard/members/new"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          + Add New Member
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No members found. Add a new member to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Age</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition">
                    {/* Member name is now a clickable link leading to their unique profile page */}
                    <td className="p-4 font-medium text-gray-900">
                      <Link href={`/dashboard/members/${member.id}`} className="text-blue-600 hover:underline">
                        {member.fullName}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">{member.phone}</td>
                    <td className="p-4 text-gray-600">{member.age}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {member.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(member.registrationDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}