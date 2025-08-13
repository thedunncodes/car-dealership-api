/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFiles: ["./.jest/setEnvVars.js"]
};