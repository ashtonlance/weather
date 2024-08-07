import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// This installs globals such as "fetch", "Response", "Request" and "Headers". See: https://remix.run/docs/en/main/other-api/node
installGlobals();

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/__*.*", "**/*.test.{js,jsx,ts,tsx}"],
    }),
    tsconfigPaths(),
    vercelPreset(),
  ],
  ssr: {
    noExternal: [/^d3.*$/, /^@nivo.*$/],
  },
});
