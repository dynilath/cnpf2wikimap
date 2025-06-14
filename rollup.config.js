import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import fs from "fs";
import { createBanner } from "./script/banner.js";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "public/InteractiveMap.js",
    format: "iife",
    name: "InteractiveMap",
    sourcemap: isProduction ? false : "inline",
    banner: `${createBanner(pkg.name, pkg.version, pkg.repository)}//<nowiki>`,
    footer: `\n//</nowiki>\n`,
  },
  external: ["L", "mediaWiki", "jQuery"],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      declaration: false,
      noEmit: false,
    }),
    replace({
      preventAssignment: true,
      __MAP_CLASS__: JSON.stringify(isProduction ? ".interactive-map": ".interactive-map-debug"),
    }),
    isProduction &&
      terser({
        format: {
          comments: (node, comment) => {
            const text = comment.value;
            return text.includes("<nowiki>") || text.includes("</nowiki>") || text.includes("License");
          },
        },
        compress: {
          drop_console: false,
        },
      }),
  ].filter(Boolean),
});
