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
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Add New Member</h1>
        <Link href="/dashboard/members" className="text-gray-500 hover:text-gray-800">
          Cancel
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form action={addMember} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="fullName" required placeholder="e.g. Deshan Vimukthi" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" name="age" required className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member's Phone</label>
              <input type="text" name="phone" required placeholder="07XXXXXXXX" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" required placeholder="Full physical address" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
              <input type="text" name="emergencyPhone" required placeholder="07XXXXXXXX" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input type="date" name="registrationDate" required defaultValue={localTodayStr} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 transition mt-4">
            Save Member Details
          </button>
        </form>
      </div>
    </div>
  );
}