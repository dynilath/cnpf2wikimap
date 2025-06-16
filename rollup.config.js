import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";
import fs from "fs";
import { createBanner } from "./script/banner.js";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const isProduction = process.env.NODE_ENV === "production";
const buildTarget = process.env.BUILD_TARGET;

// 主应用配置
const mainConfig = {
  input: "src/index.ts",
  output: {
    file: "public/InteractiveMap.js",
    format: "iife",
    name: "InteractiveMap",
    sourcemap: isProduction ? false : "inline",
    banner: `${createBanner(pkg.name, pkg.version, pkg.repository.url)}\n// @preserve <nowiki>\n`,
    footer: `\n// @preserve </nowiki>\n`,
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
      __MAP_CLASS__: JSON.stringify(isProduction ? ".interactive-map" : ".interactive-map-debug"),
    }),
    copy({
      targets: [{ src: "resource/*", dest: "public" }],
    }),
    isProduction && terser(),
  ].filter(Boolean),
};

// Leaflet 依赖库打包配置
const leafletBundleConfig = {
  input: "bundle/leaflet-bundle.js",
  output: {
    file: "public/leaflet-bundle.js",
    format: "umd",
    sourcemap: false,
    banner: `\n// @preserve <nowiki>\n`,
    footer: `\n// @preserve </nowiki>\n`,
    globals: {
      // 如果有其他全局依赖，在这里声明
    },
  },
  external: [], // 不外部化任何依赖，全部打包
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    terser(),
  ].filter(Boolean),
};

export default defineConfig(() => {
  // 如果指定了构建目标，只构建对应的配置
  if (buildTarget === "leaflet") {
    return [leafletBundleConfig];
  }

  if (buildTarget === "all") {
    return [mainConfig, leafletBundleConfig];
  }

  // 默认只构建构建主应用配置
  return [mainConfig];
});
