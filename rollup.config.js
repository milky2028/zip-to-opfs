import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import ts from "@rollup/plugin-typescript";

export default {
  input: "src/writeZiptoFileSystem.ts",
  output: { dir: "./build" },
  plugins: [resolve(), commonjs(), ts()],
};
