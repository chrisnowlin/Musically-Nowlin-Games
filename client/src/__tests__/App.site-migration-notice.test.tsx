/* @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("@/common/site/SiteMigrationNotice", () => ({
  SiteMigrationNotice: () => <div data-testid="site-migration-notice" />,
}));

vi.mock("@/common/site/SiteMigrationBanner", () => ({
  SiteMigrationBanner: () => <div data-testid="site-migration-banner" />,
}));

describe("App site migration notice", () => {
  it("renders the site migration notice from the app shell", () => {
    render(<App />);

    expect(screen.getByTestId("site-migration-notice")).toBeInTheDocument();
  });

  it("renders the persistent migration banner from the app shell", () => {
    render(<App />);

    expect(screen.getByTestId("site-migration-banner")).toBeInTheDocument();
  });
});
