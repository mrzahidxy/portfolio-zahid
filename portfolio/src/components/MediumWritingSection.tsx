import { createLogger } from "@/lib/logger";
import {
  getRecentMediumArticles,
  type MediumArticle,
} from "@/lib/medium-feed";

const MEDIUM_PROFILE_URL = "https://medium.com/@mrzahidxy";
const log = createLogger({ context: "medium-writing" });

export default async function MediumWritingSection() {
  let articles: MediumArticle[] = [];

  try {
    articles = await getRecentMediumArticles();
  } catch (error) {
    log.warn("Unable to load recent Medium articles.", error);
  }

  return (
    <section
      id="writing"
      className="relative scroll-mt-32 px-4 py-20 sm:scroll-mt-28 md:px-6 md:py-24 lg:px-8"
    >
      <div className="container max-w-6xl space-y-8 sm:space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Writing
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
              Notes from the field
            </h2>
            <p className="max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-8">
              Recent writing on full-stack development, deployment, and production work.
            </p>
          </div>
          <a
            href={MEDIUM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          >
            All posts on Medium
          </a>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {articles.map((article) => (
              <article
                key={article.link}
                className="flex h-full flex-col gap-4 rounded-[22px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/75"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <time
                    dateTime={article.publishedAt}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400"
                  >
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(article.publishedAt))}
                  </time>
                  {article.categories.length > 0 && (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
                      {article.categories[0]}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold leading-6 tracking-tight text-slate-950 dark:text-slate-50">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {article.excerpt}
                  </p>
                )}
                {article.categories.length > 1 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {article.categories.slice(1).join(" · ")}
                  </p>
                )}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex min-h-10 items-center text-sm font-semibold text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  Read on Medium <span aria-hidden="true" className="ml-1">↗</span>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-[22px] border border-slate-200/70 bg-white/80 p-5 text-sm text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/75 dark:text-slate-300">
            Recent articles are unavailable right now. Visit the Medium profile to read the latest posts.
          </p>
        )}
      </div>
    </section>
  );
}
