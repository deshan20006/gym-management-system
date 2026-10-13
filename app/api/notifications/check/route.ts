import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: NextRequest) {
  
  
  const authHeader = request.headers.get('authorization');
  
  
  if (
    process.env.NODE_ENV === 'production' && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  

  try {
    // Get today's date and set time to 00:00:00 for accurate day comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the target expiry date (2 days from today)
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 2);

    // Calculate the upper bound (the next day) to capture the full 24 hours
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find all payments that are expiring in exactly 2 days
    const expiringPayments = await prisma.payment.findMany({
      where: {
        expiryDate: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    let createdCount = 0;

    // Process each expiring payment to generate a notification
    for (const payment of expiringPayments) {
      // Check if a notification already exists for this payment to prevent duplicates
      const existingNotif = await prisma.notification.findFirst({
        where: {
          paymentId: payment.id,
          type: "RENEWAL__2_DAYS",
        },
      });

      // If no notification exists, create a new one
      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            paymentId: payment.id,
            type: "RENEWAL__2_DAYS",
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked expiring memberships. Created ${createdCount} new notifications.` 
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Failed to run notification check" }, { status: 500 });
  }
}