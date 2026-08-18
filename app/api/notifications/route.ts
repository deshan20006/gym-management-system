// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js වල Cache වීම වළක්වා සෑමවිටම අලුත්ම Notifications ලබාගැනීමට
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        payment: {
          include: {
            member: true,
          },
        },
      },
    });
    
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// Notification එකක් Dismiss (කියෙව්වා යැයි සලකා මකා දැමීම) කළ විට ක්‍රියාත්මක වීමට
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (id) {
      await prisma.notification.delete({
        where: { id },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to dismiss notification" }, { status: 500 });
  }
}