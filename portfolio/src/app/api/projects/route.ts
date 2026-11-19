import { NextResponse } from "next/server";
import Project from "@/models/Project";
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

    const projects = await Project.aggregate([
      { $match: { isArchived: { $ne: true } } },
      {
        $addFields: {
          displayOrder: { $ifNull: ["$displayOrder", 1000] },
          highlights: { $ifNull: ["$highlights", []] },
        },
      },
      { $sort: { displayOrder: 1, createdAt: -1, _id: 1 } },
      {
        $project: {
          title: 1, slug: 1, description: 1, summary: 1, highlights: 1,
          technology: 1, githubLink: 1, liveLink: 1, img: 1,
          isArchived: 1, displayOrder: 1, createdAt: 1, updatedAt: 1,
        },
      },
    ]);
    return withPublicCache({ success: true, data: projects });
  } catch (error) {
    log.error("Failed to fetch public projects.", error);
    const projects = await listPublicFallbackProjects();
    return withPublicCache({ success: true, data: projects });
  }
}
