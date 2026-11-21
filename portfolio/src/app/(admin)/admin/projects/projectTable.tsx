import Image from "next/image";
import {
  faBoxArchive,
  faImage,
  faPenToSquare,
  faRotateLeft,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AdminIconButton from "../../AdminIconButton";
import React from 'react'
import type { ProjectTableProps } from "@/lib/project-types";

export default function ProjectTable({
  projects,
  onDelete,
  onUpdate,
  onArchive,
  onRestore,
  onImageUpload,
  busyAction,
}: ProjectTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-200">
        <thead className="bg-slate-50 dark:bg-slate-900/70">
          <tr>
            <th className="w-[14%] px-4 py-3 text-left font-semibold">Title</th>
            <th className="w-[28%] px-4 py-3 text-left font-semibold">Description</th>
            <th className="w-[18%] px-4 py-3 text-left font-semibold">Technologies</th>
            <th className="w-[7%] px-4 py-3 text-center font-semibold">GitHub</th>
            <th className="w-[7%] px-4 py-3 text-center font-semibold">Live</th>
            <th className="w-[8%] px-4 py-3 text-center font-semibold">Image</th>
            <th className="w-[8%] px-4 py-3 text-center font-semibold">Status</th>
            <th className="w-[13rem] px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/20">
          {projects.map((project) => (
            <tr
              key={project._id}
              className="align-top transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
            >
              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{project.title}</td>
              <td className="max-w-xs px-4 py-3 leading-7 text-slate-600 dark:text-slate-300">{project.description}</td>
              <td className="max-w-[16rem] px-4 py-3 leading-7 text-slate-600 dark:text-slate-300">{project.technology.join(', ')}</td>
              <td className="px-4 py-3 text-center align-top">
                <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex text-sky-600 hover:underline dark:text-sky-400">
                  GitHub
                </a>
              </td>
              <td className="px-4 py-3 text-center align-top">
                <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="inline-flex text-sky-600 hover:underline dark:text-sky-400">
                  Live
                </a>
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex justify-center">
                  <Image
                    src={project.img || "/next.svg"}
                    alt={project.title}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                  />
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex justify-center">
                  <span
                    className={`inline-flex min-w-[5.5rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      project.isArchived
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                        : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {project.isArchived ? "Archived" : "Active"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex min-w-[12.5rem] items-center gap-1.5">
                  <AdminIconButton
                    label={`Edit ${project.title}`}
                    icon={faPenToSquare}
                    onClick={() => onUpdate(project._id)}
                    disabled={Boolean(busyAction)}
                  />
                  <label
                    aria-label={`Change image for ${project.title}`}
                    title={busyAction === `image-${project._id}` ? "Uploading image" : `Change image for ${project.title}`}
                    className={`admin-icon-action inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-blue-200 text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-950/50 ${busyAction ? "pointer-events-none opacity-45" : ""}`}
                  >
                    <FontAwesomeIcon icon={faImage} aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">
                      {busyAction === `image-${project._id}` ? "Uploading image" : `Change image for ${project.title}`}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={Boolean(busyAction)}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) onImageUpload(project._id, file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <AdminIconButton
                    label={project.isArchived ? `Restore ${project.title}` : `Archive ${project.title}`}
                    icon={project.isArchived ? faRotateLeft : faBoxArchive}
                    tone="accent"
                    onClick={() =>
                      project.isArchived
                        ? onRestore(project._id)
                        : onArchive(project._id)
                    }
                    disabled={Boolean(busyAction)}
                  />
                  <AdminIconButton
                    label={`Delete ${project.title}`}
                    icon={faTrashCan}
                    tone="danger"
                    onClick={() => onDelete(project._id)}
                    disabled={Boolean(busyAction)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
