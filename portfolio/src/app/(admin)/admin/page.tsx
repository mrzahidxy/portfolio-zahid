"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAxiosWithAuth } from "@/helper/request-method";
import type { ProjectListResponse } from "@/lib/project-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faBoxArchive,
  faFolderOpen,
  faPlus,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

interface ExperienceListResponse {
  success: boolean;
  data: Array<{ id?: string }>;
}

export default function DashboardPage() {
  const api = useAxiosWithAuth();
  const [activeCount, setActiveCount] = useState<number>(0);
  const [archivedCount, setArchivedCount] = useState<number>(0);
  const [experienceCount, setExperienceCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);

      const [projectResponse, experienceResponse] = await Promise.all([
        api.get<ProjectListResponse>("/admin/projects"),
        api.get<ExperienceListResponse>("/admin/experiences"),
      ]);

      const projects = projectResponse.data.data ?? [];
      setActiveCount(projects.filter((project) => !project.isArchived).length);
      setArchivedCount(projects.filter((project) => project.isArchived).length);
      setExperienceCount(experienceResponse.data.data?.length ?? 0);
    } catch (error) {
      setStatsError(getApiError(error, "Failed to load dashboard stats."));
    } finally {
      setLoadingStats(false);
    }
  }, [api]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const hasNoStats =
    !loadingStats &&
    !statsError &&
    activeCount === 0 &&
    archivedCount === 0 &&
    experienceCount === 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage projects, experience, and profile content.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/projects/add" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
              <FontAwesomeIcon icon={faPlus} aria-hidden="true" className="h-4 w-4" />
              Add project
            </Link>
          </div>
        </div>

        {statsError && (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
            <p className="font-semibold">{statsError}</p>
            <button
              type="button"
              onClick={fetchCounts}
              aria-label="Retry loading dashboard counts"
              title="Retry loading dashboard counts"
              className="admin-icon-action mt-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-500"
            >
              <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
          <StatCard
            label="Active Projects"
            value={loadingStats ? "Loading..." : activeCount}
            href="/admin/projects#active-projects"
            icon={faFolderOpen}
          />
          <StatCard
            label="Archived Projects"
            value={loadingStats ? "Loading..." : archivedCount}
            href="/admin/projects#archived-projects"
            icon={faBoxArchive}
          />
          <Link
            href="/admin/experiences"
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
          >
            <FontAwesomeIcon icon={faBriefcase} aria-hidden="true" className="mb-3 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Experience</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {loadingStats ? "Loading..." : `${experienceCount} entries`}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your role history separately from profile copy.
            </p>
          </Link>
          <Link
            href="/admin/profile"
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Profile Management
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              Update homepage copy
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Edit name, bio, contact details, and availability details.
            </p>
          </Link>
        </div>

        {hasNoStats && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
            No projects or experience entries have been added yet.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number | string;
  href: string;
  icon: typeof faFolderOpen;
}) {
  const content = (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        <FontAwesomeIcon icon={icon} aria-hidden="true" className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">{label}</span>
        <span className="mt-1 block text-2xl font-semibold text-slate-900 dark:text-white">{value}</span>
      </span>
    </div>
  );

  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
    >
      {content}
    </Link>
  );
}

function getApiError(error: unknown, fallback: string) {
  const response = (error as any)?.response?.data;
  return response?.error ?? response?.message ?? fallback;
}
