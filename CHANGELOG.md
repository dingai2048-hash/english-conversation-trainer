# 更新日志 (Changelog)

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [未发布]

### 新增
- 📜 **对话历史功能**: 自动保存和管理对话记录
  - 自动保存对话（2条消息后触发，2秒延迟）
  - AI自动生成中文摘要（5-10个字）
  - 历史记录侧边栏显示最近20条会话
  - 统计信息：总会话数、总消息数、练习天数
  - 导出历史记录为JSON文件
  - 最多保存100个会话（自动清理旧记录）
  - 创建 `ConversationHistoryService.ts` 服务
  - 创建 `CONVERSATION_HISTORY.md` 功能说明

- 🎤 **发音评价功能**: AI评价用户发音
  - 每条用户消息添加"评价发音"按钮
  - AI提供简短、鼓励性的反馈（A1-A2英语水平）
  - 包含清晰度评估和改进建议
  - AI语音朗读评价内容
  - 创建 `PRONUNCIATION_FEEDBACK.md` 功能说明

- 🔊 **Replicate TTS 支持**: 添加高质量云端语音合成选项
  - 支持 Turbo 模式（快速，低延迟）
  - 支持 HD 模式（高质量，自然）
  - 在设置中可选择浏览器TTS或Replicate TTS
  - 创建 `ReplicateTTSService.ts` 服务
  - 添加 Replicate API Key 配置
  - 新增 `REPLICATE_TTS_GUIDE.md` 使用指南

### 改进
- 🎨 **UI布局优化**:
  - 对话显示区域固定高度（600px）
  - 支持滚动查看历史消息
  - 自动滚动到最新消息
  - 历史记录侧边栏响应式设计

- 🔧 **TTS服务修复**:
  - 使用 `useRef` 保存服务实例，避免重新初始化
  - 改进语音加载和错误处理
  - 添加详细的控制台日志
  - 创建 `TROUBLESHOOTING_TTS.md` 故障排除指南

- ⚙️ **设置界面优化**: 
  - 添加语音合成设置部分
  - 支持选择TTS提供商（浏览器/Replicate）
  - 添加语音质量选择（Turbo/HD）
  - 显示费用说明和使用提示

- 📚 **文档更新**:
  - 更新 `API_SETUP_GUIDE.md` 添加TTS配置说明
  - 更新 `README.md` 添加新功能信息
  - 创建详细的 `REPLICATE_TTS_GUIDE.md`
  - 创建 `CONVERSATION_HISTORY.md`
  - 创建 `PRONUNCIATION_FEEDBACK.md`
  - 创建 `TROUBLESHOOTING_TTS.md`

### 技术改进
- 🧪 **测试覆盖**: 
  - 添加 `ReplicateTTSService.test.ts`
  - 添加 `ConversationHistoryService.test.ts`（12个测试）
  - 所有新功能测试通过
- 🔧 **类型定义**: 
  - 扩展 `AISettings` 接口支持TTS配置
  - 扩展 `ConversationSession` 接口支持消息计数
- 🏗️ **架构优化**: 
  - TTS服务支持动态切换
  - 对话历史自动保存机制
  - 使用localStorage持久化数据

### 测试
- ✅ 所有 232 个测试通过（220个原有 + 12个新增）
- ✅ 新增 ConversationHistoryService 单元测试
- ✅ 新增 ReplicateTTSService 单元测试
- ✅ 更新 SettingsService 测试以支持新字段

---

## [1.2.0] - 2024-01-XX

### 新增
- 🎨 **自定义 System Prompt**: 
  - 添加默认的陪伴式对话风格 Prompt
  - 支持用户自定义 AI 对话风格
  - 在设置中可展开/收起 Prompt 编辑器
  - 支持恢复默认 Prompt
  - 实时字符计数
  - 创建 `PROMPT_GUIDE.md` 指南

### 改进
- 📚 **文档完善**: 创建 `PROMPT_GUIDE.md` 提供 Prompt 编写指南和模板

---

## [1.1.0] - 2024-01-XX

### 新增
- ⚙️ **AI API 配置系统**:
  - 支持 6 种 AI 服务提供商（Mock, OpenAI, 豆包, Azure, Claude, 自定义）
  - 设置界面支持配置 API Key、端点、模型
  - 本地存储保存配置
  - Mock 模式指示器
  - 创建 `SettingsModal` 组件
  - 创建 `SettingsService` 服务
  - 创建 `API_SETUP_GUIDE.md` 配置指南
  - 创建 `SETTINGS_FEATURE.md` 功能说明

### 改进
- 🎨 **UI 优化**: 添加设置按钮和 Mock 模式提示横幅

---

## [1.0.0] - 2024-01-XX

### 新增
- 🎤 **语音识别**: 使用 Web Speech API 实时识别英语语音
- 🐨 **AI 考拉助手**: 友好的考拉角色提供对话练习
- 🔊 **语音合成**: AI 用英语"说话"回复（浏览器 TTS）
- 💬 **智能对话**: AI 驱动的自然对话回复
- 🌏 **中英翻译**: 可选的中文翻译辅助理解
- 📱 **响应式设计**: 支持桌面和移动设备

### 组件
- `KoalaCharacter`: 考拉角色动画组件
- `MicButton`: 麦克风录音按钮
- `ConversationDisplay`: 对话历史显示
- `TranslationToggle`: 翻译开关

### 服务
- `SpeechRecognitionService`: 语音识别服务
- `SpeechSynthesisService`: 语音合成服务（浏览器TTS）
- `AIConversationService`: AI 对话服务

### 测试
- ✅ 197 个单元测试
- ✅ 属性测试（fast-check）
- ✅ 集成测试
- ✅ 可访问性测试
- 📊 代码覆盖率 77.87%

### 文档
- `README.md`: 项目说明
- `PROJECT_SUMMARY.md`: 项目总结
- `QUICK_START.md`: 快速开始指南

---

## 版本说明

### 版本号规则
遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 变更类型
- **新增 (Added)**: 新功能
- **改进 (Changed)**: 对现有功能的变更
- **弃用 (Deprecated)**: 即将移除的功能
- **移除 (Removed)**: 已移除的功能
- **修复 (Fixed)**: 任何 bug 修复
- **安全 (Security)**: 安全相关的修复

---

**最后更新**: 2024-01-XX
