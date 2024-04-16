import { json } from "@remix-run/node";
import { createRemixStub } from "@remix-run/testing";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import HomePage from "app/routes/_index";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  import.meta.env.GOOGLE_MAPS_API_KEY =
    "AIzaSyAemoL7VieMHoZzfwnM6UNLWksHCIJWjpQ";
});

afterAll(() => {
  delete import.meta.env.GOOGLE_MAPS_API_KEY;
});

describe("Home Page", () => {
  const user = userEvent.setup();
  const RemixStub = createRemixStub([
    {
      path: "/",
      Component: HomePage,
      loader() {
        return json({ message: "hello from loader" });
      },
    },
  ]);

  it('should render the "Forecast Comparison" heading', async () => {
    render(<RemixStub />);
    await waitFor(() => screen.getByText("Forecast Comparison"));
  });

  it("should render two CityInput components on load", async () => {
    render(<RemixStub />);
    await waitFor(() => {
      const cityInputs = screen.getAllByPlaceholderText("Enter city and state");
      expect(cityInputs.length).toBe(2);
    });
  });
});
