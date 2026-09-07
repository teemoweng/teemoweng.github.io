# TEEMO / PLAY — 复古掌机审阅稿

在现有经典主页的自我介绍后，立即展示可操作的掌机，作为第一个内容板块。首屏的简历、联系、掌机和 GitHub 四个入口保持同一行，小屏使用简短标签。独立分支 `codex/retro-handheld-20260907` 从当前 main 开始，不包含此前档案袋版改动。

预览：https://teemo-pocket-review.vercel.app/?lang=zh#playground

## 视觉与内容

灰白塑料机身、深色屏框、绿屏像素显示、紫红 A/B 键、电源滑块与扬声器开槽。方向键、A/B 和 Start/Select 都有实际操作反馈。Select 可切换绿屏和琥珀屏；音效默认关闭，由访客主动开启。

内容包括玩家档案、项目关卡、技能背包、联系入口和一个可通关的迷宫彩蛋。四个项目分别是 CareerBuddy、AI Shopping Guide、RepoLens、CiteCook，每个项目用两页交代问题与设计选择，并保留真实体验和源码链接。介绍依据现有主页，不新增业绩数字或技能分数。迷宫中的收集点仅是游戏进度。

参考：[Zyon学长聊ai「一段不到 50 个字的提示词做出创意简历~」](https://www.xiaohongshu.com/explore/6a9bcefe0000000011035f79)。借鉴实体掌机式交互；机身、排版、内容和迷宫在本站独立实现，没有打包参考视频或第三方截图。

## 操作

- 掌机默认展开，标题栏可收起为一行；再次展开保留页面与游戏进度。收起时暂停迷宫。首屏「玩一下掌机」入口会自动展开。
- 按 Start 或屏幕「开始」进入；方向键选择，A 确认，B 返回。
- 鼠标和手机可以直接点屏幕菜单及实体按键。
- 掌机获得焦点时，键盘方向键和 A/B、Enter/Escape 可操作；Tab 正常离开。
- Start 回主菜单，Select 切换屏幕颜色；电源可开关。
- 彩蛋中收集三个灵感点，再抵达出口。离开掌机焦点、切换窗口或滚出视口会暂停；按 A 恢复。
- 全部内容支持中英文。`?lang=zh` / `?lang=en` 可指定打开语言。

## 实现与验收

保持仓库单 HTML 结构：CSS 和控制器留在根目录 `index.html`，无新运行时依赖或构建步骤。像素字体 Silkscreen 本地托管，授权文件一同保留于 `uploads/handheld/`。无 JavaScript 时仍提供文字和项目入口。

`tests/test_handheld.mjs` 覆盖板块顺序、按钮同排、键盘展开与收起、折叠后进度保留、实际按钮通关、碰墙、菜单、项目翻页、双语、真实链接、触控、键盘焦点、电源中断、音效启停、暂停与恢复、reduced-motion、无 JS，以及 320/390/900/1440px 双语屏幕边界。后台隐藏的事件处理使用模拟 `visibilitychange` 验证，不代表真实操作系统后台生命周期测试。

原能力卡回归仍检查独立翻转、两端布局、语言切换与锚点。原 Python 测试一并保留。

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
node tests/test_capability_map.mjs
node tests/test_handheld.mjs
# Playwright 可通过 NODE_PATH 引入；非默认 Chrome 可设置 CHROME_PATH。
# 在线验收可为掌机测试设置 BASE_URL。
```

只供审阅：main、GitHub Pages、`v1/` 与 `v2/` 不在本次修改范围。
