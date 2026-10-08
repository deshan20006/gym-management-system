// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    
    const user = await (prisma as any).staff.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), 
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await (prisma as any).staff.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password reset successfully." }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An error occurred while resetting password." }, { status: 500 });
  }
}