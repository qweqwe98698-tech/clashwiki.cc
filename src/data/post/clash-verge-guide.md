---
publishDate: 2026-06-17T13:00:00Z
title: '2026年 Clash Verge Rev 客户端配置与使用指南'
excerpt: 'Clash Verge Rev 是目前最受欢迎的开源 Clash 客户端，完美继承了原版内核并深度开发。本文为您提供从零开始的安装、订阅导入、分流规则优化及常见故障排除的详细教程。'
image: '~/assets/images/default.png'
category: 'tutorials'
tags:
  - Clash
  - 教程
  - Windows
  - macOS
metadata:
  title: '2026年 Clash Verge Rev 客户端配置指南 - ClashWiki'
  description: 'Clash Verge Rev 官方下载与配置教程。详细介绍如何安装、导入订阅链接、开启系统代理并设置分流。'
---

随着原版 Clash 内核及客户端相继停止维护，基于 **Mihomo (Meta) 内核** 深度开发的 **Clash Verge Rev** 已经成为当前 Windows、macOS 和 Linux 平台上首选的主流客户端。它不仅拥有精致的现代化 UI，还支持最新的代理协议与规则分流技术。

本文将为您带来最详尽的新手配置指南。

---

## 1. 客户端下载与安装

由于 Clash Verge Rev 是一个完全开源的项目，我们**强烈建议**仅从官方发布渠道或可信的 Wiki 站点下载，避免下载到被恶意注入的修改版。

*   **官方 GitHub 仓库**：[clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev)
*   **安装包选择说明**：
    *   **Windows 用户**：推荐下载 `.msi` 或 `x64_en-US.msi` 安装包。
    *   **macOS 用户**：
        *   Apple M 系列芯片选择 `aarch64.dmg`。
        *   Intel 芯片选择 `x64.dmg`。

---

## 2. 核心使用步骤

安装完成后，打开客户端，按照以下步骤即可配置完成：

### 第一步：获取并导入订阅链接
1. 登录您的机场后台，复制 **Clash 订阅链接** (或使用订阅转换生成的 URL)。
2. 打开 Clash Verge Rev 客户端，点击左侧菜单栏的 **“订阅 (Profiles)”**。
3. 在顶部的输入框中粘贴您复制的订阅链接，然后点击 **“导入 (Import)”**。
4. 导入成功后，鼠标**单击**选中该配置文件，使其右侧显示绿色的激活状态。

### 第二步：选择代理节点
1. 点击左侧菜单栏的 **“代理 (Proxies)”**。
2. 推荐选择 **“规则 (Rule)”** 模式（这能实现国内流量直连，国外流量走代理）。
3. 展开各个策略组（如 Proxy、Google、Netflix 等），手动挑选延迟较低的节点。

### 第三步：开启系统代理
1. 点击左侧菜单栏的 **“设置 (Settings)”** 或首页。
2. 找到 **“系统代理 (System Proxy)”** 选项，将其开关**打开**。
3. 此时，您的浏览器和系统流量已经开始通过代理网络传输。

---

## 3. 常见问题与解决方案 (FAQ)

### Q: 导入订阅时提示 "Fetch Error"？
*   **检查网络**：请确保在不使用代理的情况下能正常访问机场网站，或者使用手机热点尝试。
*   **链接格式**：部分机场链接包含特殊字符，请尝试使用“订阅转换”将其转为标准的 Clash 订阅。

### Q: 开启系统代理后网页仍然无法打开？
1.  **检查时间同步**：这是最常见的原因！Windows 系统时间若与北京时间相差超过 60 秒，会导致握手失败。请在 Windows 设置中点击“立即同步”时间。
2.  **端口冲突**：默认混合端口为 `7897`，请检查是否有其他代理软件（如 v2rayN）占用了此端口。
