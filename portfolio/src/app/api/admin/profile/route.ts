import { NextRequest, NextResponse } from "next/server";
import { uploadResumeToCloudinary } from "@/helper/common-method";
import { createLogger } from "@/lib/logger";
import { adminProfileSchema } from "@/lib/profile-admin";
import {
  readAdminProfileApiContent,
  updateAdminProfileContent,
} from "@/lib/profile-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const log = createLogger({ context: "api/admin/profile" });
const MAX_RESUME_SIZE = 4 * 1024 * 1024;
const MAX_MULTIPART_SIZE = MAX_RESUME_SIZE + 64 * 1024;

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength !== null) {
      const requestSize = Number(contentLength);
      if (!Number.isSafeInteger(requestSize) || requestSize < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid upload request size." },
          { status: 400 }
        );
      }
      if (requestSize > MAX_MULTIPART_SIZE) {
        return NextResponse.json(
          { success: false, error: "Résumé must be a PDF no larger than 4 MB." },
          { status: 413 }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get("resume");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Choose a résumé PDF to upload." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" || file.size > MAX_RESUME_SIZE) {
      return NextResponse.json(
        { success: false, error: "Résumé must be a PDF no larger than 4 MB." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (!fileBuffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      return NextResponse.json(
        { success: false, error: "The selected file is not a valid PDF." },
        { status: 400 }
      );
    }

    const fileUri = `data:application/pdf;base64,${fileBuffer.toString("base64")}`;
    const upload = await uploadResumeToCloudinary(fileUri);
    if (!upload.success) {
      log.error("Failed to upload résumé to Cloudinary.", upload.error);
      return NextResponse.json(
        { success: false, error: "Résumé upload failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: { url: upload.url } });
  } catch (error) {
    log.error("Failed to process résumé upload.", error);
    return NextResponse.json(
      { success: false, error: "Résumé upload failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: await readAdminProfileApiContent(),
    });
  } catch (error) {
    log.error("Failed to load admin profile content.", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile content." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adminProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please correct the highlighted fields.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updatedProfile = await updateAdminProfileContent(parsed.data);

    return NextResponse.json({
      success: true,
      message: "Profile content updated successfully.",
      data: updatedProfile,
    });
  } catch (error) {
    log.error("Failed to update admin profile content.", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile content." },
      { status: 500 }
    );
  }
}
