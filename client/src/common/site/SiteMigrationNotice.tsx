import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/ui/dialog";
import { Button } from "@/common/ui/button";
import { useState } from "react";

export const NEW_SITE_URL = "https://musicallynowlin.com";
export const SITE_MIGRATION_NOTICE_DISMISSED_KEY =
  "musically-nowlin.site-migration-notice.dismissed.v1";

function hasDismissedMigrationNotice() {
  try {
    return localStorage.getItem(SITE_MIGRATION_NOTICE_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function persistMigrationNoticeDismissal() {
  try {
    localStorage.setItem(SITE_MIGRATION_NOTICE_DISMISSED_KEY, "true");
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function SiteMigrationNotice() {
  const [open, setOpen] = useState(() => !hasDismissedMigrationNotice());

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      persistMigrationNoticeDismissal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] gap-5 rounded-lg border-2 border-amber-300 bg-white p-5 text-slate-900 shadow-2xl sm:max-w-md sm:p-6">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-2xl font-bold leading-tight text-slate-950">
            Musically Nowlin is moving
          </DialogTitle>
          <DialogDescription className="text-base leading-7 text-slate-700">
            This games site is planned to shut down in the future. Please use
            the new Musically Nowlin site for future visits.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 sm:justify-start sm:space-x-0">
          <Button asChild className="w-full sm:w-auto">
            <a href={NEW_SITE_URL}>
              Go to new site
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Stay here for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
