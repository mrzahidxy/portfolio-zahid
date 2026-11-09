import { NextResponse } from "next/server";
import Project, { IProject } from "@/models/Project";
import { dbConnectForPublicRead } from "@/lib/dbConnect";
import { createLogger } from "@/lib/logger";
import { listPublicFallbackProjects } from "@/lib/profile-content";

export const dynamic = "force-dynamic";
const log = createLogger({ context: "api/projects" });

const withPublicCache = <T>(payload: T) =>
  NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });

export async function GET() {
  try {
    const connection = await dbConnectForPublicRead(5000);
    if (!connection) {
      const projects = await listPublicFallbackProjects();
      return withPublicCache({ success: true, data: projects });
    }

    const projects = await Project.find<IProject>({
      isArchived: { $ne: true },
    });
    return withPublicCache({ success: true, data: projects });
  } catch (error) {
    log.error("Failed to fetch public projects.", error);
    const projects = await listPublicFallbackProjects();
    return withPublicCache({ success: true, data: projects });
  }
}
