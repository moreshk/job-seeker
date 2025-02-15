/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/lib/email";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
        verificationToken,
      },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
      return NextResponse.json({ message: "User created successfully. Please check your email to verify your account." });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json({ message: "User created successfully, but we couldn't send a verification email. Please contact support." });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
} 