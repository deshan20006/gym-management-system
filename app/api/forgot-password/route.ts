import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Check if the staff member exists
    const user = await prisma.staff.findUnique({
      where: { email },
    });

    // For security reasons, we do not reveal if the email is registered or not
    if (!user) {
      return NextResponse.json(
        { message: "If this email is registered, a reset link has been sent." },
        { status: 200 }
      );
    }

    // 2. Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // 3. Save the token and expiry time in the database
    await prisma.staff.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 4. Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // The link that the user will click to reset the password
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // 5. Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MR.FITNESS GYM - Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">MR.FITNESS GYM</h2>
          <p>You requested a password reset for your staff management account.</p>
          <p>Click the button below to safely reset your password. This link is valid for exactly 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 15px 0; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "If this email is registered, a reset link has been sent." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}