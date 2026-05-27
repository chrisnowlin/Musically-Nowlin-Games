/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NEW_SITE_URL,
  SITE_MIGRATION_NOTICE_DISMISSED_KEY,
  SiteMigrationNotice,
} from "../SiteMigrationNotice";

describe("SiteMigrationNotice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the shutdown message when the visitor has not dismissed it", () => {
    render(<SiteMigrationNotice />);

    expect(
      screen.getByRole("dialog", { name: /musically nowlin is moving/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this games site is planned to shut down/i)
    ).toBeInTheDocument();
  });

  it("links the primary action to the replacement site", () => {
    render(<SiteMigrationNotice />);

    expect(
      screen.getByRole("link", { name: /go to new site/i })
    ).toHaveAttribute("href", NEW_SITE_URL);
  });

  it("persists dismissal when the visitor chooses to stay", async () => {
    const user = userEvent.setup();
    render(<SiteMigrationNotice />);

    await user.click(screen.getByRole("button", { name: /stay here for now/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(SITE_MIGRATION_NOTICE_DISMISSED_KEY)).toBe(
      "true"
    );
  });

  it("does not show again after dismissal has been stored", () => {
    localStorage.setItem(SITE_MIGRATION_NOTICE_DISMISSED_KEY, "true");

    render(<SiteMigrationNotice />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
