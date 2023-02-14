<p align="center">
  <img src="https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/icons/loop.png" alt="Circular Dependency Icon" height="150">
</p>

<h1 align="center">Circular Dependency</h1>
<p align="center">The VSCode's extendsion to detect circular dependencies<p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=he110te4m.vscode-circular-dependency">View in the VSCode extension marketplace</a>
</p>
<p align="center">
  <a href="https://github.com/He110te4m/vscode-circular-dependency/blob/main/apps/vscode-circular-dependency/README-zh-CN.md">中文介绍</a>
</p>

<br>

# Features

- Custom Alarm mode:
  - [x] Support for configuring alarm levels: error, warning, no warning.

- Detect circular dependencies:
  - [x] Circular dependency detection for JavaScript/TypeScript.
  - [x] Identify ESM, CommonJS.
  - [x] Support for default suffixes and default index files.
  - [x] Identifying aliases, third-party packages, and so on.
  - [x] Identify dependencies such as Vite that use glob for bulk imports.
  - [x] Identify the comments.
  - [x] Custom import syntax, which can be used for circular dependency detection in other languages or other module format syntax by configuring it.

- View circular dependencies:
  - [x] Jump to ring file.
  - [x] View the dependency loop diagram.
  - [x] Jump any file in a dependent ring.

# Usages

- Basic

![](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/examples/base_check.gif)

- Support for automatic completion of module suffixes

![](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/examples/autofill-suffix.gif)

- The default index of module is supported

![](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/examples/default-index.gif)

- `Glob` import syntax is supported

![](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/examples/glob.gif)

- Supports jumping to any dependency in the circular dependency

![](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/examples/goto-any-dependency-module.gif)

# Configuration

> Unless otherwise specified, the configuration content is the plugin default.

## Features toggle

```json5
{
  // Configure the warning level with an enumeration value: ["error", "warning", "none"].
  "vscode-circular-dependency.error-level": "error",

  // Allows extended persistence of cached data. When enabled, the cached data is recovered after VSCode restart.
  "vscode-circular-dependency.allow-persistent-caching": true,

  // During suspension, a dependency diagram is displayed for circular dependencies, and jumps to the corresponding file are supported
  "vscode-circular-dependency.enable-dependency-loop": false
}
```

## Project environment

```json5
{
  // The relative path where the third-party package is stored, which is used to detect whether the dependency is a third-party package, and then ends the branch.
  "vscode-circular-dependency.packages-root": "node_modules",

  // The project path alias is configured, with `key` as the alias and `value` as the actual path to point to.
  // Values are generally relative paths, but absolute paths are also supported.
  // Alias nesting is not supported now.
  "vscode-circular-dependency.alias-map": {
    "@": "src",
    "src": "src",
    "~": "src"
  }
}
```

## Syntax checking

```json5
{
  // Comment configuration
  // Only line and block comment characters are supported
  "vscode-circular-dependency.comment-chars": [
    // Configure single-line comments
    ["//"],
    // Configure block comments
    ["/*", "*/"],
    ["/**", "*/"]
  ],

  // Match the regular expression of the import module
  "vscode-circular-dependency.import-statement-regexp": [
    // Match the ESM static import module syntax, such as:
    // `import A from 'xxx'` or `import { xxx } from 'xxx'`
    // `import type {} from 'xxx'` does not match because it does not affect builds and does not cause circular dependencies
    "(?:import\\s+(?:[^\\{\\s]+|\\{(?:.*?)\\})\\s+from\\s+)(?<quote>['\"])(.*?)\\k<quote>",
    // Match the ESM Dynamic Import Module, such as: `import()`
    "(?:import\\s*\\(\\s*)(?<quote>['\"])(.*?)\\k<quote>",
    // Match the CommonJS Dynamic Import Module, such as: `require()`
    "(?:require\\s*\\(\\s*)(?<quote>['\"])(.*?)\\k<quote>"
  ],

  // Match `glob` dynamic import
  "vscode-circular-dependency.glob-import-statement-regexp": [
    // Matches the glob import syntax of Vite
    "(?:import\\.meta\\.glob\\(\\s*)(?<quote>['\"])(.*?)\\k<quote>"
  ]
}
```

## Configure the default behavior for resolving address-dependent

```json5
{
  // When the import module is not found, support automatic completion of the file suffix, according to the order of array matching
  "vscode-circular-dependency.autofill-suffix-list": [
    "ts",
    "js",
    "cjs",
    "mjs"
  ],

  // Import module as a directory, automatically find the default file, you need to fill in the full file name, does not support omitting the suffix, according to the array order match
  "vscode-circular-dependency.default-indexs": [
    "index.ts",
    "index.js",
    "index.cjs",
    "index.mjs"
  ]
}
```

# Thanks

- [threedayAAAAA](https://github.com/threedayAAAAA) suggested the idea of supporting the default index file and the corresponding feature PR

# Sponsor me

> If this project helps you, please sponsor me for a cup of coffee to better provide follow-up services.

<img alt="WeChat" src="https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/sponsor/WeChatPay.jpg" width="240px" />
<img alt="ALi" src="https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/main/apps/vscode-circular-dependency/images/sponsor/ALiPay.jpg" width="240px" />

# License

[GPL](./LICENSE) License © 2021-Present [牡龙](https://github.com/He110te4m)
