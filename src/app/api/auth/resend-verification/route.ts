import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/lib/email";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (error) {
    console.error('Error in resend-verification:', error);
    return NextResponse.json({ error: "Error resending verification email" }, { status: 500 });
  }
}
