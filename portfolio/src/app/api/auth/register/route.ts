import CryptoJS from "crypto-js";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

// Register handler
export async function POST(req: NextRequest) {
  const log = createLogger({ context: "api/auth/register" });
  const connection = await dbConnect();
  if (!connection) {
    return NextResponse.json(
      { success: false, message: "Database is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }
    const passSecret = process.env.PASS_SEC;
    if (!passSecret) {
      return NextResponse.json(
        { success: false, message: "Password secret is not configured." },
        { status: 500 }
      );
    }

    // Encrypt password
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      passSecret
    ).toString();
    // Create and save new user
    // Public registration must never grant privileged roles from caller input.
    const newUser = new User({ email: email.trim().toLowerCase(), password: encryptedPassword, isAdmin: false });
    const savedUser = await newUser.save();

    return NextResponse.json(
      { success: true, user: { id: String(savedUser._id), email: savedUser.email, isAdmin: false } },
      { status: 201 }
    );
  } catch (error) {
    log.error("Failed to create user.", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
