// app/dashboard/members/new/page.tsx

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

// Server action to handle the form submission
async function addMember(formData: FormData) {
  "use server";
  
  const fullName = formData.get("fullName") as string;
  const age = parseInt(formData.get("age") as string);
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;
  const registrationDateStr = formData.get("registrationDate") as string;

  // Parse the date string coming from the form into a Javascript Date object
  const [year, month, day] = registrationDateStr.split("-").map(Number);
  const registrationDate = new Date(year, month - 1, day);

  await prisma.member.create({
    data: {
      fullName,
      age,
      phone,
      address,
      emergencyPhone,
      registrationDate,
    },
  });

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

export default function AddMemberPage() {
  // Get today's date to set as the default value for the Join Date input
  const today = new Date();
  const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pr-12 md:pr-0">
      
      {/* Header Section with Cancel Button */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-4">
        
        {/* Dark Glass Box for Heading Readability */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Add New Member
          </h1>
        </div>
        
        {/* Cancel Button - වඩාත් පැහැදිලි පෙනුම */}
        <Link 
          href="/dashboard/members" 
          className="px-6 py-2.5 text-sm font-bold text-white bg-black/40 border border-white/20 hover:bg-black/60 rounded-xl transition shadow-lg z-10"
        >
          Cancel
        </Link>
      </div>

      {/* Form Container with Blur Effect */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-6 md:p-8">
        <form action={addMember} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              required 
              placeholder="e.g. Deshan Vimukthi" 
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition shadow-inner" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Age</label>
              <input 
                type="number" 
                name="age" 
                required 
                placeholder="e.g. 25"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition shadow-inner" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Member's Phone</label>
              <input 
                type="text" 
                name="phone" 
                required 
                placeholder="07XXXXXXXX" 
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition shadow-inner" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Address</label>
            <textarea 
              name="address" 
              required 
              placeholder="Full physical address" 
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition shadow-inner h-28 resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Emergency Contact Phone</label>
              <input 
                type="text" 
                name="emergencyPhone" 
                required 
                placeholder="07XXXXXXXX" 
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition shadow-inner" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Join Date</label>
              <input 
                type="date" 
                name="registrationDate" 
                required 
                defaultValue={localTodayStr} 
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition shadow-inner [color-scheme:dark]" 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-blue-600/80 border border-blue-500/50 hover:bg-blue-600 text-white font-bold p-4 rounded-xl transition shadow-md mt-4 text-base"
          >
            Save Member Details
          </button>
        </form>
      </div>
    </div>
  );
}