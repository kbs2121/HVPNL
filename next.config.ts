import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "three",
    "maplibre-gl",
    "@deck.gl/core",
    "@deck.gl/layers",
    "@deck.gl/mapbox",
    "@deck.gl/react",
    "@deck.gl/extensions",
  ],
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
