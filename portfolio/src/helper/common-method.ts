import cloudinary from "@/lib/cludinary";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

type UploadResponse =
  | { success: true; result: UploadApiResponse }
  | { success: false; error: UploadApiErrorResponse };

export const uploadToCloudinary = async (
  fileUri: string,
  fileName: string
): Promise<UploadResponse> => {
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      invalidate: true,
      resource_type: "auto",
      filename_override: fileName,
      folder: "protfolio-images",
      use_filename: true,
    });

    return { success: true, result };
  } catch (error) {
    return { success: false, error: error as UploadApiErrorResponse };
  }
};

export const uploadResumeToCloudinary = async (fileUri: string) => {
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      invalidate: true,
      resource_type: "raw",
      folder: "portfolio-resumes",
      public_id: "resume.pdf",
      overwrite: true,
    });

    return { success: true as const, url: result.secure_url };
  } catch (error) {
    return { success: false as const, error };
  }
};
