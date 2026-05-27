/* @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NEW_SITE_URL } from "../SiteMigrationNotice";
import { SiteMigrationBanner } from "../SiteMigrationBanner";

describe("SiteMigrationBanner", () => {
  it("shows a persistent shutdown message", () => {
    render(<SiteMigrationBanner />);

    expect(
      screen.getByText(/this games site is planned to shut down/i)
    ).toBeInTheDocument();
  });

  it("links to the replacement site", () => {
    render(<SiteMigrationBanner />);

    expect(
      screen.getByRole("link", { name: /visit the new site/i })
    ).toHaveAttribute("href", NEW_SITE_URL);
  });

  it("does not include a dismiss control", () => {
    render(<SiteMigrationBanner />);

    expect(
      screen.queryByRole("button", { name: /close|dismiss|stay here/i })
    ).not.toBeInTheDocument();
  });
});
