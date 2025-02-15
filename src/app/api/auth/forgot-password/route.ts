import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/app/lib/email";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json({ message: "If an account exists, you will receive a password reset email." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('Password reset email sent successfully');
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Even if email fails, don't reveal this to the user
    }

    return NextResponse.json({ message: "If an account exists, you will receive a password reset email." });
  } catch (error) {
    console.error('Error processing forgot password request:', error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
} 