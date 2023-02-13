<p align="center">
  <img src="https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/c853cef5247a10bc1d75f0d21530d07aeb81d89d/apps/vscode-circular-dependency/icons/loop.svg" alt="Circular Dependency Icon" height="150">
</p>

<h1 align="center">循环依赖检测</h1>
<p align="center">一个用于检测循环依赖的 VSCode 扩展<p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=he110te4m.vscode-circular-dependency">在 VSCode 扩展商店中查看</a>
</p>
<p align="center">
  <a href="https://github.com/He110te4m/vscode-circular-dependency/blob/main/apps/vscode-circular-dependency/README.md">Introduction in English</a>
</p>

<br>

# 特性

- 自定义告警方式
  - [x] 支持配置告警级别：错误、警告、不告警

- 检测循环依赖
  - [x] JavaScript / TypeScript 循环依赖检测
  - [x] 识别 ESM、CommonJS
  - [x] 支持缺省后缀名与默认 index 文件
  - [x] 识别别名、第三方包等
  - [x] 识别 Vite 等使用 glob 批量导入的依赖
  - [x] 识别注释
  - [x] 自定义导入语法（通过配置可用于其他语言或其他模块格式语法下的循环依赖检测）

- 查看循环依赖
  - [x] 跳转到成环文件
  - [x] 查看依赖环图
  - [x] 跳转依赖环中任意文件

# 功能示例



# 配置项

> 如无特别说明，配置内容即为插件默认值

## 特性开关

```json5
{
  // 配置告警级别，支持 [ "error", "warning", "none" ]
  "vscode-circular-dependency.error-level": "error",

  // 允许扩展持久化缓存数据。启用后，将在 VSCode 重启后恢复缓存数据
  "vscode-circular-dependency.allow-persistent-caching": true,

  // 在悬浮时，展示循环依赖的依赖关系图，并支持跳转到对应文件中
  "vscode-circular-dependency.enable-dependency-loop": false
}
```

## 项目运行环境

```json5
{
  // 第三方包存放的相对路径，用于检测依赖是否为第三方包，是则结束分支
  "vscode-circular-dependency.packages-root": "node_modules",

  // 项目路径别名配置，key 为别名，value 为实际指向的路径
  // value 取值一般为相对路径，也支持绝对路径
  // 暂不支持别名嵌套
  "vscode-circular-dependency.alias-map": {
    "@": "src",
    "src": "src",
    "~": "src"
  }
}
```

## 语法检测

```json5
{
  // 注释符配置
  // 暂时只支持【行注释符】与【块注释符】
  "vscode-circular-dependency.comment-chars": [
    // 配置单行注释符
    ["//"],
    // 配置块注释符
    ["/*", "*/"],
    ["/**", "*/"]
  ],

  // 匹配导入模块的正则表达式
  "vscode-circular-dependency.import-statement-regexp": [
    // 匹配  ESM 静态导入模块，如：
    // `import A from 'xxx'` 或者 `import { xxx } from 'xxx'`
    // 不匹配 `import type {} from 'xxx'`，因为其不会对构建产生影响，不会导致循环依赖
    "(?:import\\s+(?:[^\\{\\s]+|\\{(?:.*?)\\})\\s+from\\s+)(?<quote>['\"])(.*?)\\k<quote>",
    // 匹配 ESM 动态导入模块，如： `import()`
    "(?:import\\s*\\(\\s*)(?<quote>['\"])(.*?)\\k<quote>",
    // 匹配 CommonJS 导入模块，如： `require()`
    "(?:require\\s*\\(\\s*)(?<quote>['\"])(.*?)\\k<quote>"
  ],

  // 匹配 glob 动态导入
  "vscode-circular-dependency.glob-import-statement-regexp": [
    // 匹配 Vite 最新的 glob 导入语法
    "(?:import\\.meta\\.glob\\(\\s*)(?<quote>['\"])(.*?)\\k<quote>"
  ]
}
```

## 配置解析依赖地址的默认行为

```json5
{
  // 导入模块未找到时，支持自动补全文件后缀，按数组顺序匹配
  "vscode-circular-dependency.autofill-suffix-list": [
    "ts",
    "js",
    "cjs",
    "mjs"
  ],

  // 导入模块为目录时，自动查找默认文件，需要填写完整文件名，不支持省略后缀，按数组顺序匹配
  "vscode-circular-dependency.default-indexs": [
    "index.ts",
    "index.js",
    "index.cjs",
    "index.mjs"
  ]
}
```

# 致谢

- [threedayAAAAA](https://github.com/threedayAAAAA) 提出需要支持默认 index 文件的 idea 及对应的特性 PR

# 赞助我

> 如果这个项目对你有帮助，请赞助我喝杯咖啡，以更好的提供后续服务。

![WeChat](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/c853cef5247a10bc1d75f0d21530d07aeb81d89d/apps/vscode-circular-dependency/images/sponsor/WeChatPay.jpg)

![ALi](https://raw.githubusercontent.com/He110te4m/vscode-circular-dependency/c853cef5247a10bc1d75f0d21530d07aeb81d89d/apps/vscode-circular-dependency/images/sponsor/ALiPay.jpg)

# 许可证

[GPL](./LICENSE) License © 2021-Present [牡龙](https://github.com/He110te4m)
