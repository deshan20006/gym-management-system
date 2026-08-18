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
  // Add exactly 1 month to the payment date
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

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const memberId = resolvedParams.id;

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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{member.fullName}'s Profile</h1>
        
        <div className="flex items-center gap-4">
          <form action={deleteMember}>
            <input type="hidden" name="memberId" value={member.id} />
            <DeleteButton />
          </form>

          <Link href="/dashboard/members" className="text-gray-500 hover:text-gray-800 transition bg-white px-4 py-2 rounded-lg border border-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Member Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Details</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p><span className="font-medium text-gray-900">Age:</span> {member.age}</p>
            <p><span className="font-medium text-gray-900">Phone:</span> {member.phone}</p>
            <p><span className="font-medium text-gray-900">Emergency:</span> {member.emergencyPhone}</p>
            <p><span className="font-medium text-gray-900">Joined:</span> {formatToYYYYMMDD(member.registrationDate)}</p>
            <p><span className="font-medium text-gray-900">Address:</span> {member.address}</p>
          </div>
        </div>

        {/* Right Column: Add Payment Form & History */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Add Payment Box */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Record New Payment</h2>
            <form action={addPayment} className="flex gap-4 items-end">
              <input type="hidden" name="memberId" value={member.id} />
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input 
                  type="date" 
                  name="paymentDate" 
                  required 
                  defaultValue={localTodayStr} 
                  className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                <input 
                  type="number" 
                  name="amount" 
                  required 
                  placeholder="e.g. 3000"
                  className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium h-[42px] transition">
                Mark as Paid
              </button>
            </form>
          </div>

          {/* Payment History Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            {member.payments.length === 0 ? (
              <p className="text-gray-500 text-sm">No payments recorded yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 font-medium text-gray-600">Payment Date</th>
                    <th className="p-3 font-medium text-gray-600">Amount</th>
                    <th className="p-3 font-medium text-red-600">Expiry Date</th>
                    <th className="p-3 font-medium text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {member.payments.map((payment) => {
                    
                    const invoiceUrl = `http://localhost:3000/api/invoice/${payment.id}`;
                    
                    const invoiceMsg = `Hi ${member.fullName},\n\nThank you for your payment of Rs. ${payment.amount} at FITNESS PRO.\n\nPayment Date: ${formatToYYYYMMDD(payment.paymentDate)}\nValid Until: ${formatToYYYYMMDD(payment.expiryDate)}\n\nYou can view and download your receipt here:\n${invoiceUrl}\n\nThank you!`;
                    
                    const waLink = buildWhatsAppLink(member.phone, invoiceMsg);

                    return (
                      <tr key={payment.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-gray-800">{formatToYYYYMMDD(payment.paymentDate)}</td>
                        <td className="p-3 text-gray-700">Rs. {payment.amount.toString()}</td>
                        <td className="p-3 text-red-600 font-medium">{formatToYYYYMMDD(payment.expiryDate)}</td>
                        
                        <td className="p-3 text-right flex items-center justify-end gap-2">
                          
                          <a 
                            href={invoiceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition border border-blue-100"
                          >
                            View PDF
                          </a>

                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded transition border border-green-100"
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
            )}
          </div>

        </div>
      </div>
    </div>
  );
}