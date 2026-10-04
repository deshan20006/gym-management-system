// app/dashboard/members/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import DeletePaymentButton from "./DeletePaymentButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Helper function to format date as YYYY/MM/DD
function formatToYYYYMMDD(date: Date | string) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// 1. Server action to handle new payment creation
async function addPayment(formData: FormData) {
  "use server";
  
  const memberId = formData.get("memberId") as string;
  const amount = formData.get("amount") as string;
  const paymentDateStr = formData.get("paymentDate") as string;

  const [year, month, day] = paymentDateStr.split("-").map(Number);
  const paymentDate = new Date(year, month - 1, day);
  
  const expiryDate = new Date(paymentDate);
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  await prisma.payment.create({
    data: {
      memberId,
      amount: parseFloat(amount),
      paymentDate,
      expiryDate,
      isPaid: true,
    },
  });

  revalidatePath(`/dashboard/members/${memberId}`);
}

// 2. Server action to handle member deletion
async function deleteMember(formData: FormData) {
  "use server";
  
  const memberId = formData.get("memberId") as string;
  
  await prisma.member.delete({
    where: { id: memberId }
  });

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

// 3. Server action to handle individual payment deletion
async function deletePayment(formData: FormData) {
  "use server";

  const paymentId = formData.get("paymentId") as string;
  const memberId = formData.get("memberId") as string;

  await prisma.payment.delete({
    where: { id: paymentId },
  });

  revalidatePath(`/dashboard/members/${memberId}`);
}

// 4. අලුතින් එකතු කරපු Server action එක (Member ගේ විස්තර Update කිරීමට)
async function updateMember(formData: FormData) {
  "use server";

  const memberId = formData.get("memberId") as string;
  const fullName = formData.get("fullName") as string;
  const age = parseInt(formData.get("age") as string, 10);
  const phone = formData.get("phone") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;
  const address = formData.get("address") as string;

  await prisma.member.update({
    where: { id: memberId },
    data: {
      fullName,
      age,
      phone,
      emergencyPhone,
      address
    }
  });

  revalidatePath(`/dashboard/members/${memberId}`);
  redirect(`/dashboard/members/${memberId}`);
}

// Component එකට searchParams එකතු කරලා තියෙනවා (Edit mode එක අඳුරගන්න)
export default async function MemberProfilePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ edit?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const memberId = resolvedParams.id;
  const isEditing = resolvedSearchParams.edit === 'true'; // Edit බටන් එක ඔබලද කියලා බලනවා

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { 
      payments: { orderBy: { paymentDate: 'desc' } } 
    }
  });

  if (!member) notFound();

  const today = new Date();
  const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pr-12 md:pr-8">
      
      {/* Header Section */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-4">
        
        {/* Dark Glass Box for Member Name */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
            {member.fullName}&apos;s Profile
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* Edit Button (Edit mode එකේ නැති වෙලාවට විතරක් පෙන්වයි) */}
          {!isEditing && (
            <Link 
              href={`/dashboard/members/${member.id}?edit=true`}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600/80 border border-blue-500/30 hover:bg-blue-600 rounded-xl transition shadow-xl flex items-center justify-center h-[42px]"
            >
              Edit
            </Link>
          )}

          <form action={deleteMember}>
            <input type="hidden" name="memberId" value={member.id} />
            <DeleteButton />
          </form>

          <Link 
            href="/dashboard/members" 
            className="px-5 py-2.5 text-sm font-bold text-white bg-black/60 border border-white/30 hover:bg-black/80 rounded-xl transition shadow-xl flex items-center justify-center h-[42px]"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Member Details OR Edit Form */}
        <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl border border-white/10 h-fit">
          
          {isEditing ? (
            /* --- Edit Mode Form --- */
            <>
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-3">Edit Details</h2>
              <form action={updateMember} className="space-y-4">
                <input type="hidden" name="memberId" value={member.id} />
                
                <div>
                  <label className="block text-xs font-semibold text-blue-200 uppercase mb-1">Full Name</label>
                  <input type="text" name="fullName" defaultValue={member.fullName} required className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-blue-200 uppercase mb-1">Age</label>
                  <input type="number" name="age" defaultValue={member.age} required className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 uppercase mb-1">Phone</label>
                  <input type="text" name="phone" defaultValue={member.phone} required className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 uppercase mb-1">Emergency Contact</label>
                  <input type="text" name="emergencyPhone" defaultValue={member.emergencyPhone} required className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 uppercase mb-1">Address</label>
                  <textarea name="address" defaultValue={member.address} required rows={2} className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-white/10">
                  <button type="submit" className="flex-1 bg-green-600/80 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition shadow-md">
                    Save
                  </button>
                  <Link href={`/dashboard/members/${member.id}`} className="flex-1 bg-gray-600/80 hover:bg-gray-600 text-white font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center">
                    Cancel
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* --- Normal View Mode --- */
            <>
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-3">Details</h2>
              <div className="space-y-4 text-sm text-gray-300 mt-5">
                <p className="flex flex-col"><span className="font-semibold text-blue-200 text-xs uppercase tracking-wider mb-1">Age</span> <span className="text-white text-base font-medium">{member.age}</span></p>
                <p className="flex flex-col"><span className="font-semibold text-blue-200 text-xs uppercase tracking-wider mb-1">Phone</span> <span className="text-white text-base font-medium">{member.phone}</span></p>
                <p className="flex flex-col"><span className="font-semibold text-blue-200 text-xs uppercase tracking-wider mb-1">Emergency Contact</span> <span className="text-white text-base font-medium">{member.emergencyPhone}</span></p>
                <p className="flex flex-col"><span className="font-semibold text-blue-200 text-xs uppercase tracking-wider mb-1">Joined Date</span> <span className="text-white text-base font-medium">{formatToYYYYMMDD(member.registrationDate)}</span></p>
                <p className="flex flex-col"><span className="font-semibold text-blue-200 text-xs uppercase tracking-wider mb-1">Address</span> <span className="text-white text-base font-medium leading-relaxed">{member.address}</span></p>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Add Payment Form & History */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Add Payment Box (Glass Effect) */}
          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-5">Record New Payment</h2>
            <form action={addPayment} className="flex flex-col md:flex-row gap-4 items-end">
              <input type="hidden" name="memberId" value={member.id} />
              
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Payment Date</label>
                <input 
                  type="date" 
                  name="paymentDate" 
                  required 
                  defaultValue={localTodayStr} 
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition [color-scheme:dark]"
                />
              </div>
              
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Amount (Rs.)</label>
                <input 
                  type="number" 
                  name="amount" 
                  required 
                  placeholder="e.g. 3000"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                />
              </div>

              <button 
                type="submit" 
                className="w-full md:w-auto bg-blue-600/80 border border-blue-500/50 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-md h-[46px] flex items-center justify-center"
              >
                Mark as Paid
              </button>
            </form>
          </div>

          {/* Payment History Table (Glass Effect) */}
          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-5">Payment History</h2>
            
            {member.payments.length === 0 ? (
              <div className="p-8 text-center text-gray-300 bg-white/5 rounded-xl border border-white/10">
                No payments recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="pb-3 px-2 font-semibold text-gray-300 uppercase tracking-wider text-xs">Payment Date</th>
                      <th className="pb-3 px-2 font-semibold text-gray-300 uppercase tracking-wider text-xs">Amount</th>
                      <th className="pb-3 px-2 font-semibold text-gray-300 uppercase tracking-wider text-xs">Expiry Date</th>
                      <th className="pb-3 px-2 font-semibold text-gray-300 uppercase tracking-wider text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {member.payments.map((payment: any) => {
                      
                      const invoiceUrl = `https://gym-management-system-phi-ten.vercel.app/api/invoice/${payment.id}`;
                      
                      const invoiceMsg = `Hi ${member.fullName},\n\nThank you for your payment of Rs. ${payment.amount} at MR.FITNESS GYM.\n\nPayment Date: ${formatToYYYYMMDD(payment.paymentDate)}\nValid Until: ${formatToYYYYMMDD(payment.expiryDate)}\n\nYou can view and download your receipt here:\n${invoiceUrl}\n\nThank you!`;
                      
                      const waLink = buildWhatsAppLink(member.phone, invoiceMsg);

                      return (
                        <tr key={payment.id} className="hover:bg-white/5 transition duration-200">
                          <td className="py-4 px-2 font-medium text-white">{formatToYYYYMMDD(payment.paymentDate)}</td>
                          <td className="py-4 px-2 font-bold text-gray-200">Rs. {payment.amount.toString()}</td>
                          <td className="py-4 px-2 text-rose-300 font-medium">{formatToYYYYMMDD(payment.expiryDate)}</td>
                          
                          <td className="py-4 px-2 text-right flex items-center justify-end gap-2">
                            
                            <a 
                              href={invoiceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-300 hover:text-blue-200 font-bold text-xs bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg transition border border-blue-500/30 shadow-sm"
                            >
                              View PDF
                            </a>

                            <a 
                              href={waLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-300 hover:text-green-200 font-bold text-xs bg-green-500/20 hover:bg-green-500/30 px-3 py-1.5 rounded-lg transition border border-green-500/30 shadow-sm"
                            >
                              WhatsApp
                            </a>
                            
                            <form action={deletePayment} className="inline">
                              <input type="hidden" name="paymentId" value={payment.id} />
                              <input type="hidden" name="memberId" value={member.id} />
                              <DeletePaymentButton />
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}