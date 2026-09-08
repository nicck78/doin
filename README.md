<div align="center">

<img src="./public/logo.png" alt="doin logo" width="100" height="100" style="border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" />

# doin

**一款沉静、克制、具备多日时间轴与防休眠专注计时的 Windows 独立桌面效率软件**

[![Platform](https://img.shields.io/badge/Platform-Windows-0078d7.svg?style=flat-square&logo=windows)](https://microsoft.com)
[![Electron](https://img.shields.io/badge/Electron-v31.3.1-47848F.svg?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18.3.1-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D20.0.0-339933.svg?style=flat-square&logo=node.js)](https://nodejs.org/)

[快速开始](#-小白快速上手) • [核心特性](#-核心特性) • [数据主权与安全](#-数据主权与备份恢复) • [技术架构](#-技术架构与目录) • [开发实录](#-公众号真实开发实录)

</div>

---

## 📖 项目愿景

**doin** 诞生于一位零编程基础大学生与 AI（Google Antigravity）的结对编程实践中。它旨在打破商业待办软件“功能臃肿、广告打扰、强制登录、云端收费”的怪圈，回归个人数字生活的本质——**沉浸、纯净、安全、自律**。

软件融合了：
1. **今日聚焦（Today's Focus）**：无干扰的短期待办推进；
2. **多日全景（Multi-day Timeline）**：跨越多天的长期待办横向贯通，避免 deadline 遗忘；
3. **精准专注（Anti-drift Timer）**：采用绝对时间戳比对算法，电脑锁屏/休眠分秒不差；
4. **每日日志（Daily Journal）**：一张宽敞舒展的纯白书写板，随手沉淀当天的思绪与灵感；
5. **极简纯色美学**：深度致敬 Antigravity 极致纯白（Light）与深邃黑曜石（Dark）双向美感。

---

## ✨ 核心特性

### 1. 今日清单 · 极简克制
- **零废话界面**：摒弃繁琐的报表与说教，仅保留任务骨架、进度微线与清爽书写框；
- **长短期智能分流**：当天截止与持续推进中的跨天任务清晰排列；
- **内联安全防误触**：废除引起窗口脱焦的原生弹窗，卡片平滑内联确认，打字焦点自愈永不卡顿。

### 2. 多日全景 · 跨天横向甘特连线
- **滚动 7 天时间轴**：近几日与未来几日全局排期一目了然；
- **同任务连贯拉通**：持续多天的长期待办以专属色彩横向拉通成圆角长条，任务推进状态一览无余；
- **日志快捷锚点**：每个日期网格提供一键入口，随时回看或追加历史日志。

### 3. 精准专注 · 杜绝后台时间漂移
- **双模自由切换**：默认正向秒表，支持一键切换为 25 分钟番茄倒计时；
- **时间戳比对引擎**：摒弃单纯依赖 `setInterval` 累加的粗糙机制，采用系统绝对时间戳实时校准，即使 Windows 进入睡眠、息屏或后台挂起，唤醒后时间依然精准严密；
- **悦耳禅音提示**：内置基于 Web Audio API 的轻量双音节钟声，纯本地合成，零网络音频依赖。

### 4. 每日日志 · 宽敞的思考抽屉
- **极简单框书写**：不再强制分类，下笔即写，支持记录任何心得、反思或随笔；
- **客观事实自动浮现**：顶部自动呈现当日累计专注时长与完成任务数，为复盘提供精准的事实依据。

### 5. 100% 本地数据主权
- **免登录、零网络依赖**：无需手机号、无需注册、无需租用任何云端服务器；
- **透明 JSON 存储**：所有数据均持久保存在用户本地磁盘，提供一键【导出备份】与【导入恢复】功能，用户对自己的数据拥有 100% 控制权。

---

## 🚀 小白快速上手（零基础 30 秒运行）

本项目专为非程序员优化，无需复杂的编译环境：

### 方式一：一键双击启动（最推荐）
1. 确保电脑已安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）；
2. 打开项目根目录，找到齿轮图标的批处理文件：
   👉 **`启动doin.bat`**
3. 鼠标左键双击，即可在桌面正中央拉起 `doin` 软件独立窗口！

### 方式二：命令行启动
打开终端（PowerShell 或 CMD），进入项目目录后依次执行：
```bash
# 1. 安装项目依赖（首次运行需执行）
npm install

# 2. 启动桌面应用
npm start
```

---

## 🔒 数据主权与备份恢复

用户的全部待办清单、专注记录与每日日志均透明存储在本地：

- **存储格式**：标准 JSON 文本文件（纯明文、无私有加密绑架）；
- **如何导出备份**：
  点击顶部导航栏右上角的【导出备份】图标，即可将一份带时间戳的 `doin-backup-YYYY-MM-DD.json` 文件保存至任意文件夹或 U 盘；
- **如何恢复数据**：
  重装系统或换新电脑后，点击【导入备份】图标，选择之前的 JSON 文件，所有历史数据将在 0.1 秒内无损还原；
- **零成本保障**：服务器费用为 **￥0**，彻底规避云端服务商停服导致数据丢失的风险。

---

## 🛠 技术架构与目录

本项目遵循现代轻量级桌面客户端最佳实践：

```
doin/
├── public/                     # 静态公共资源
│   └── logo.png                # 专属品牌 IP 徽标
├── electron/                   # 桌面端主进程
│   ├── main.cjs                # 窗口生命周期、安全 IPC 与本地持久化
│   └── preload.cjs             # 安全渲染桥接层 (contextBridge)
├── src/                        # 前端交互与界面层 (React 18)
│   ├── assets/                 # 媒体资产
│   ├── components/             # 功能组件
│   │   ├── Navbar.jsx          # 极简发丝导航与 IP 徽章
│   │   ├── TodayTasks.jsx      # 今日聚焦、极简清单与内联防误触
│   │   ├── CalendarGantt.jsx   # 滚动 7 天多日横向贯通时间轴
│   │   ├── FocusTimer.jsx      # 防休眠绝对时间戳专注计时器
│   │   ├── DailyReviewModal.jsx# 每日日志大书写板
│   │   └── TaskFormModal.jsx   # 新建与编辑待办模态框
│   ├── storage/                # 数据管理与防丢双模机制
│   │   ├── storageManager.js   # 本地 JSON 读写与导入导出
│   │   └── defaultData.js      # 初始体验引导数据
│   ├── utils/                  # 核心算法库
│   │   ├── dateUtils.js        # 跨天计算与时间轴窗口算法
│   │   └── timerEngine.js      # 防漂移绝对时间戳引擎与 Web Audio 提示音
│   ├── App.jsx                 # 全局状态协同与纯色主题切换
│   ├── index.css               # Antigravity 极致纯白/纯黑与 paper-card 样式
│   └── main.jsx                # React 根挂载
├── test/                       # 自动化单元测试集 (Node Native Test)
│   ├── dateUtils.test.js       # 日期算法与跨天逻辑测试
│   └── timerEngine.test.js     # 防休眠时间戳算法严谨性测试
├── 启动doin.bat                # Windows 一键无乱码纯净双击启动脚本
├── package.json                # 工程依赖与 npm 脚本
├── 第二篇-开发实验记录.md       # 真实开发全过程事实、Bug 实录与公众号素材包
└── README.md                   # 本交付指南
```

---

## 🧪 自动化测试与质量保障

项目使用 Node 24 原生测试引擎进行严谨的单元测试：

```bash
# 运行全套自动化测试
npm test
```
**测试覆盖范围**：
- [x] 时间戳差值防休眠/防挂起漂移计算（模拟 30 分钟休眠恢复精准性）；
- [x] 滚动 7 天日历窗口生成与边界计算；
- [x] 跨多天任务起止交集判定算法；
- [x] 时间格式化（MM:SS / HH:MM:SS）边界测试。

---

## 📝 公众号真实开发实录

本项目不仅是一款自用软件，更是全国首批**零编程基础大学生与 AI 深度结对编程**的真实全过程试验。

完整的原始事实、错误日志、时间与金钱成本核算，请参阅：
👉 [《第二篇-开发实验记录.md》](./第二篇-开发实验记录.md)

---

## 📄 开源许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。代码开源、自由修改、无商业束缚。
