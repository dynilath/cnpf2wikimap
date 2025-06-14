# InteractiveMap - 现代化重构

这是一个基于 TypeScript 和 Rollup 的现代化 InteractiveMap 项目重构版本。

## 项目结构

```
src/
├── index.ts                 # 主入口文件
├── components/              # 组件目录
│   ├── CustomTileLayer.ts   # 自定义瓦片图层
│   ├── MarkerEditor.ts      # 标记编辑器
│   └── MarkerManager.ts     # 标记管理器
├── core/                    # 核心功能
│   └── MapManager.ts        # 地图管理器
├── services/                # 服务层
│   ├── ApiService.ts        # API 服务
│   └── IconService.ts       # 图标服务
├── types/                   # 类型定义
│   └── index.ts             # 接口和类型定义
├── utils/                   # 工具函数
│   ├── globals.ts           # 全局工具函数
│   └── hash.ts              # MD5 哈希工具
└── constants/               # 常量定义
    └── index.ts             # 项目常量
```

## 开发环境

### 依赖

- **TypeScript**: 类型安全的 JavaScript 超集
- **Rollup**: 模块打包器
- **pnpm**: 包管理器

### 脚本命令

```bash
# 开发构建（无压缩）
pnpm run build:dev

# 监视模式开发
pnpm run dev

# 生产构建
pnpm run build

# 类型检查
pnpm run type-check
```

## 特性

### 🎯 现代化架构
- **模块化设计**: 每个功能都拆分为独立的模块
- **TypeScript**: 提供类型安全和更好的开发体验
- **ES2015+**: 使用现代 JavaScript 特性

### 🔧 开发体验
- **热重载**: 开发模式下自动重新构建
- **类型检查**: 编译时捕获错误
- **代码组织**: 清晰的目录结构和职责分离

### 🏗️ 构建系统
- **Rollup**: 高效的模块打包
- **UserScript 兼容**: 自动生成符合 UserScript 标准的输出
- **跨平台**: 支持 Windows/macOS/Linux

## 主要组件

### MapManager
地图管理器，负责：
- 初始化地图实例
- 管理地图配置
- 协调各个组件

### MarkerManager
标记管理器，负责：
- 标记的增删改查
- 标记事件处理
- 标记数据同步

### MarkerEditor
标记编辑器，负责：
- 标记信息编辑界面
- 创建新标记
- 编辑现有标记

### ApiService
API 服务，负责：
- 与后端 API 通信
- 数据获取和保存
- 错误处理

### IconService
图标服务，负责：
- 图标加载和缓存
- 自定义图标处理
- 默认图标管理

## 配置文件

### tsconfig.json
TypeScript 编译配置：
- 目标 ES2015
- 启用严格模式（部分）
- 支持 DOM 类型

### rollup.config.js
Rollup 打包配置：
- 输入：`src/index.ts`
- 输出：`InteractiveMap.js`
- 格式：IIFE（立即执行函数）
- 外部依赖：Leaflet, jQuery

### globals.d.ts
全局类型声明：
- Leaflet (L)
- MediaWiki
- jQuery ($)

## 开发指南

### 添加新功能

1. 在相应目录创建新文件
2. 定义必要的类型（在 `types/index.ts`）
3. 实现功能逻辑
4. 在主模块中集成
5. 运行构建测试

### 类型安全

项目使用 TypeScript 提供类型安全：
- 为所有函数参数和返回值定义类型
- 使用接口定义数据结构
- 利用 TypeScript 的类型推断

### 构建输出

最终输出的 `InteractiveMap.js` 包含：
- UserScript 头部注释
- 完整的应用代码
- 全局变量包装（L, mediaWiki, jQuery）
- UserScript 尾部注释

## 迁移说明

从原始单文件版本迁移到模块化版本的主要变化：

1. **文件拆分**: 原本的单个大文件被拆分为多个模块
2. **类型安全**: 添加了 TypeScript 类型定义
3. **现代语法**: 使用 ES2015+ 的类和模块语法
4. **构建流程**: 引入了现代化的构建工具链

## 故障排除

### 常见问题

1. **构建失败**: 检查 TypeScript 错误和类型定义
2. **运行时错误**: 确保全局变量（L, $, mediaWiki）可用
3. **模块解析错误**: 检查导入路径是否正确

### 调试技巧

1. 使用 `pnpm run type-check` 检查类型错误
2. 开发模式下查看详细的构建输出
3. 在浏览器控制台查看运行时错误
