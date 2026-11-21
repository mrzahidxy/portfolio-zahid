import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type AdminIconButtonProps = {
  label: string;
  icon: IconDefinition;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "danger" | "accent";
};

const toneClasses = {
  neutral:
    "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white",
  danger:
    "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/50",
  accent:
    "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-950/50",
};

export default function AdminIconButton({
  label,
  icon,
  onClick,
  disabled = false,
  tone = "neutral",
}: AdminIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`admin-icon-action inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-transparent text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-45 ${toneClasses[tone]}`}
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
