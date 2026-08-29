// app/dashboard/members/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatToYYYYMMDD(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export default async function MembersPage() {
  const members = await prisma.member.findMany({ orderBy: { registrationDate: 'desc' } });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Section with Button */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-4 pr-12 md:pr-0">
        
        {/* Dark Glass Box for Heading Readability */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Gym Members
          </h1>
        </div>
        
        {/* Button - Updated to match Glass/Faded Theme */}
        <Link 
          href="/dashboard/members/new"
          className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600/80 border border-blue-500/50 hover:bg-blue-600 rounded-xl transition shadow-md flex items-center justify-center gap-2 z-10"
        >
          + Add New Member
        </Link>
      </div>
      
      {/* Members Table with beautiful Blur Effect */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-4 md:p-6 overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center text-gray-200 text-lg font-medium">
            No members found. Add a new member to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/20 text-gray-200 font-bold tracking-wider text-sm">
                  <th className="pb-4 px-4 uppercase">Name</th>
                  <th className="pb-4 px-4 uppercase">Phone</th>
                  <th className="pb-4 px-4 uppercase">Age</th>
                  <th className="pb-4 px-4 uppercase">Status</th>
                  <th className="pb-4 px-4 uppercase">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/10 transition duration-200">
                    <td className="py-5 px-4 font-semibold text-base">
                      {/* Name changed to White */}
                      <Link href={`/dashboard/members/${member.id}`} className="text-white hover:text-gray-300 transition drop-shadow-md">
                        {member.fullName}
                      </Link>
                    </td>
                    <td className="py-5 px-4 text-white font-medium text-base">{member.phone}</td>
                    <td className="py-5 px-4 text-white font-medium text-base">{member.age}</td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border tracking-widest uppercase shadow-sm ${
                        member.status === 'active' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-white font-medium text-base">
                      {formatToYYYYMMDD(member.registrationDate)}
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