# CN PF2 Wiki Map

[![CI](https://github.com/dynilath/cnpf2wikimap/actions/workflows/ci.yml/badge.svg)](https://github.com/dynilath/cnpf2wikimap/actions/workflows/ci.yml)

一个基于 Leaflet 的交互式地图系统，专为 Pathfinder 2e 中文 Wiki 设计。

## 目录
- [CN PF2 Wiki Map](#cn-pf2-wiki-map)
  - [目录](#目录)
  - [开发环境设置](#开发环境设置)
    - [快速开始](#快速开始)
    - [前置要求](#前置要求)
    - [安装依赖](#安装依赖)
    - [开发命令](#开发命令)
  - [开发指南](#开发指南)
    - [开发流程](#开发流程)
    - [持续集成](#持续集成)
    - [构建过程](#构建过程)
    - [文件说明](#文件说明)
    - [外部依赖](#外部依赖)
  - [部署](#部署)
  - [在 PF2E Wiki 中测试](#在-pf2e-wiki-中测试)
      - [1. 准备测试环境](#1-准备测试环境)
      - [2. 安装油猴脚本](#2-安装油猴脚本)
      - [3. 在 Wiki 页面中测试](#3-在-wiki-页面中测试)
      - [4. 开发调试流程](#4-开发调试流程)
      - [注意事项](#注意事项)


## 开发环境设置

### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/dynilath/cnpf2wikimap.git
cd cnpf2wikimap

# 2. 安装依赖
pnpm install

# 3. 启动开发模式
pnpm run dev

# 4. 在另一个终端启动预览服务器
pnpm run serve
```

### 前置要求

- Node.js 22+ (推荐最新LTS版本)
- pnpm (包管理器)

### 安装依赖

```bash
# 使用 pnpm 安装依赖
pnpm install
```

### 开发命令

```bash
# 开发模式 - 启动文件监听和自动重新构建
pnpm run dev

# 开发构建 - 构建一次开发版本
pnpm run build:dev

# 生产构建 - 构建压缩的生产版本
pnpm run build

# 类型检查 - 仅检查 TypeScript 类型，不生成文件
pnpm run type-check

# 本地服务器 - 启动本地 HTTP 服务器预览
pnpm run serve
```

## 开发指南

### 开发流程

1. **启动开发环境**
   ```bash
   pnpm run dev
   ```

2. **编辑源代码**
   - 源代码位于 `src/` 目录
   - 如果使用 `pnpm run dev`，会自动监听文件变化并重新构建

3. **测试更改**
   ```bash
   # 启动本地服务器
   pnpm run serve
   ```
   然后访问 `http://localhost:14001` 查看效果

4. **类型检查**
   ```bash
   pnpm run type-check
   ```

### 持续集成

项目使用 GitHub Actions 进行自动化CI检查：

- **触发时机**: 所有推送到主分支和 Pull Request
- **检查内容**: 
  - TypeScript 类型检查 (`pnpm run type-check`)
  - 开发构建验证 (`pnpm run build:dev`)
- **运行环境**: Node.js 22.x, Ubuntu Latest
- **状态查看**: 查看项目主页的 CI 徽章或 [Actions 页面](https://github.com/dynilath/cnpf2wikimap/actions)

### 构建过程

构建过程使用 Rollup 进行：

1. **TypeScript 编译** - 将 TypeScript 代码编译为 JavaScript
2. **模块打包** - 将所有模块打包为单个 IIFE 格式的文件
3. **资源复制** - 将 `resource/` 目录中的文件复制到 `public/` 目录
4. **代码压缩** - 生产构建时进行代码压缩和优化

### 文件说明

- **输出文件**: `public/InteractiveMap.js` - 最终的打包文件
- **油猴脚本**: `public/loader.user.js` - 用于在 PF2E Wiki 中加载本地开发版本的油猴脚本
- **源映射**: 开发模式下生成内联源映射便于调试

### 外部依赖

项目依赖以下外部库（在运行时由宿主页面提供）：

- `L` (Leaflet) - 地图库
- `mediaWiki` - MediaWiki API
- `jQuery` - DOM 操作库

## 部署

生产构建完成后，将 `public/` 目录中的文件部署到目标环境即可。

## 在 PF2E Wiki 中测试

在实际的 PF2E Wiki 环境中测试本地开发的代码：

#### 1. 准备测试环境

1. **启动本地开发服务器**
   ```bash
   # 启动开发模式（监听文件变化）
   pnpm run dev
   
   # 启动本地服务器
   pnpm run serve
   ```

2. **确保本地服务正常运行**
   - 访问 `http://localhost:14001/InteractiveMap.js` 确认文件可以访问
   - 访问 `http://localhost:14001/loader.user.js` 确认加载器可以访问

#### 2. 安装油猴脚本

1. **安装油猴扩展**
   - Chrome/Edge: 安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: 安装 [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) 或 [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. **添加加载脚本**
   - 在油猴管理界面创建新脚本，复制 `public/loader.user.js` 的内容到新脚本中
   - 或者直接访问 `http://localhost:14001/loader.user.js` 并点击安装
   - 保存并启用脚本
   
   **脚本功能**：
   - 自动匹配 `pf2.huijiwiki.com` 域名
   - 检测到匹配页面时自动加载本地开发版本的 `InteractiveMap.js`
   - 添加时间戳避免缓存问题

#### 3. 在 Wiki 页面中测试

1. **使用 Map-Debug 组件**
   在 PF2E Wiki 页面中添加以下代码：
   ```mediawiki
    <div class="w-[600px] h-auto p-4 bg-gray-100 border border-gray-300 rounded">{{Map-Debug
    | tileTemplate = 内海地图-$x-$y-$z.png
    | tileSize = 500,500
    | tileBaseZoom = 3
    | bounds = 3264,4183
    | zoomRange = 1,3
    | marker = data:内海地图.json
    | style = height:400px;
    | initLoc = 艾巴萨罗姆
    | zoom = 3
    }}</div>
   ```

2. **查看效果**
   - 油猴脚本会自动检测 `.interactive-map-debug` 元素
   - 从本地服务器 (`http://localhost:14001/InteractiveMap.js`) 加载最新的开发代码
   - 在页面上初始化交互式地图

#### 4. 开发调试流程

1. **修改源代码** - 在 `src/` 目录中编辑文件
2. **自动重新构建** - `pnpm run dev` 会自动监听变化并重新构建
3. **刷新页面** - 在 Wiki 页面刷新即可看到最新修改
4. **查看日志** - 打开浏览器开发者工具查看控制台输出

#### 注意事项

- **CORS 设置**: 确保本地服务器允许跨域请求（`http-server` 默认支持）
- **缓存问题**: 如果更改没有生效，尝试强制刷新页面（Ctrl+F5）
- **调试模式**: 开发版本会输出详细的调试信息到控制台
- **生产测试**: 使用 `pnpm run build` 构建生产版本进行最终测试

这种方式允许你在真实的 Wiki 环境中测试本地开发的代码，无需每次都部署到服务器。
