/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// we need to create this file because at this time in Remix v2.8.1 vitest doesnt work well in the vite.config.ts
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    env: loadEnv("", process.cwd(), ""),
    alias: [
      {
        find: "@nivo/annotations",
        replacement: "@nivo/annotations/dist/nivo-annotations.es.js",
      },
      { find: "@nivo/arcs", replacement: "@nivo/arcs/dist/nivo-arcs.es.js" },
      { find: "@nivo/axes", replacement: "@nivo/axes/dist/nivo-axes.es.js" },
      { find: "@nivo/bar", replacement: "@nivo/bar/dist/nivo-bar.es.js" },
      {
        find: "@nivo/colors",
        replacement: "@nivo/colors/dist/nivo-colors.es.js",
      },
      { find: "@nivo/core", replacement: "@nivo/core/dist/nivo-core.es.js" },
      {
        find: "@nivo/legends",
        replacement: "@nivo/legends/dist/nivo-legends.es.js",
      },
      { find: "@nivo/line", replacement: "@nivo/line/dist/nivo-line.es.js" },
      { find: "@nivo/pie", replacement: "@nivo/pie/dist/nivo-pie.es.js" },
      {
        find: "@nivo/recompose",
        replacement: "@nivo/recompose/dist/nivo-recompose.es.js",
      },
      {
        find: "@nivo/scales",
        replacement: "@nivo/scales/dist/nivo-scales.es.js",
      },
      {
        find: "@nivo/scatterplot",
        replacement: "@nivo/scatterplot/dist/nivo-scatterplot.es.js",
      },
      {
        find: "@nivo/tooltip",
        replacement: "@nivo/tooltip/dist/nivo-tooltip.es.js",
      },
      {
        find: "@nivo/voronoi",
        replacement: "@nivo/voronoi/dist/nivo-voronoi.es.js",
      },
    ],
  },
});
