export interface Project {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  summary?: string;
  highlights?: string[];
  displayOrder?: number;
  technology: string[];
  githubLink: string;
  liveLink?: string;
  img?: string;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPayload {
  title: string;
  description: string;
  summary?: string;
  highlights: string;
  displayOrder: number;
  technology: string;
  githubLink: string;
  liveLink?: string;
}

export interface ProjectFormValues extends Omit<ProjectPayload, "liveLink" | "displayOrder"> {
  liveLink: string;
  displayOrder: string;
  summary: string;
  img?: string;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
}

export type PublicProjectListResponse =
  | { success: true; data: Project[] }
  | { success: false; message: string };

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface DeleteProjectResponse {
  success: boolean;
  deletedId: string;
}

export interface ProjectFeedback {
  type: "success" | "error";
  message: string;
}

type ProjectActionKind = "archive" | "delete" | "image" | "restore";

export type ProjectBusyAction = `${ProjectActionKind}-${string}` | null;

export interface ProjectTableProps {
  projects: Project[];
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  busyAction: ProjectBusyAction;
}
