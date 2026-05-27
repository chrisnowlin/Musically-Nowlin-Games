import { ExternalLink, Megaphone } from "lucide-react";
import { NEW_SITE_URL } from "@/common/site/SiteMigrationNotice";

export function SiteMigrationBanner() {
  return (
    <aside className="relative z-40 border-b border-amber-300 bg-amber-100 px-4 py-3 text-amber-950 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-2 text-sm font-medium leading-6 sm:flex-row sm:items-center sm:justify-center sm:text-center">
        <span className="flex items-center gap-2">
          <Megaphone aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>
            This games site is planned to shut down. Please use the new
            Musically Nowlin site.
          </span>
        </span>
        <a
          className="inline-flex items-center gap-1 rounded-md font-semibold text-blue-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-amber-100"
          href={NEW_SITE_URL}
        >
          Visit the new site
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  );
}
