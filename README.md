# 英语对话训练器 (English Conversation Trainer)

一个基于Web的英语口语练习应用，通过与AI考拉角色对话来提升英语口语能力。

## ✨ 功能特性

- 🎤 **语音识别**: 使用Web Speech API实时识别英语语音
- 🐨 **AI考拉助手**: 友好的考拉角色提供对话练习
- 🔊 **语音对话**: AI会用英语"说话"回复你（TTS语音合成）
- 💬 **智能对话**: AI驱动的自然对话回复
- 🌏 **中英翻译**: 可选的中文翻译辅助理解
- 📱 **响应式设计**: 支持桌面和移动设备
- ✅ **全面测试**: 204个测试用例，覆盖率77.87%

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 打开

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage

# 运行测试（非交互模式）
npm test -- --watchAll=false
```

### 构建生产版本

```bash
npm run build
```

## 🎯 使用方法

1. **打开应用**: 在Chrome或Edge浏览器中访问应用
2. **允许麦克风权限**: 首次使用时需要授权麦克风访问
3. **开始对话**: 点击麦克风按钮开始录音
4. **说英语**: 对着麦克风说英语
5. **停止录音**: 再次点击麦克风按钮停止
6. **听AI回复**: 考拉会用英语"说话"回复你（自动语音合成）
7. **查看文字**: 同时显示对话文字内容
8. **切换翻译**: 点击右上角的翻译按钮显示/隐藏中文翻译

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **语音识别**: Web Speech API
- **AI服务**: OpenAI API (支持Mock模式)
- **状态管理**: React Context API
- **测试**: Jest + React Testing Library + fast-check (属性测试)

## 📁 项目结构

```
src/
├── components/          # UI组件
│   ├── KoalaCharacter.tsx
│   ├── MicButton.tsx
│   ├── ConversationDisplay.tsx
│   └── TranslationToggle.tsx
├── context/            # 状态管理
│   └── AppContext.tsx
├── services/           # 服务层
│   ├── SpeechRecognitionService.ts
│   └── AIConversationService.ts
├── types/              # TypeScript类型定义
│   └── index.ts
├── integration/        # 集成测试
└── App.tsx            # 主应用组件
```

## 🧪 测试

项目包含全面的测试覆盖：

- **单元测试**: 测试各个组件和服务的功能
- **属性测试**: 使用fast-check进行基于属性的测试
- **集成测试**: 测试组件间的交互
- **可访问性测试**: 确保应用符合无障碍标准

### 测试统计

- ✅ 204个测试全部通过
- 📊 组件覆盖率: 100%
- 📊 服务覆盖率: 94.85%
- 📊 总体覆盖率: 77.87%

## 🌐 浏览器支持

### 语音识别
- ✅ Chrome (推荐)
- ✅ Edge (推荐)
- ⚠️ Safari (语音识别支持有限)
- ❌ Firefox (不支持Web Speech API语音识别)

### 语音合成
- ✅ Chrome (推荐)
- ✅ Edge (推荐)
- ✅ Safari (支持)
- ✅ Firefox (支持)

## 🔧 配置

### Mock模式 (开发/测试)

默认使用Mock模式，AI会返回预设的回复，无需配置：

```typescript
// 自动使用Mock模式
// 无需API Key
```

### 配置真实AI API

应用支持多种AI服务提供商：

1. **点击右上角的"设置"按钮** ⚙️
2. **选择AI服务商**:
   - OpenAI (GPT-3.5/GPT-4)
   - 豆包 (字节跳动)
   - Azure OpenAI
   - Anthropic Claude
   - 自定义API
3. **输入API Key**
4. **选择模型**
5. **保存设置**

详细配置指南请查看 [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)

### 支持的AI服务

| 服务商 | 特点 | 获取方式 |
|--------|------|----------|
| Mock | 免费测试 | 无需配置 |
| OpenAI | 高质量对话 | [platform.openai.com](https://platform.openai.com) |
| 豆包 | 中文优秀 | [火山引擎](https://console.volcengine.com/ark) |
| Azure OpenAI | 企业级 | [Azure Portal](https://portal.azure.com) |
| Claude | 安全性高 | [Anthropic](https://console.anthropic.com) |

## 📝 开发规范

项目遵循严格的开发规范：

- **EARS模式**: 需求使用EARS模式编写
- **属性测试**: 每个属性测试运行50-100次迭代
- **类型安全**: 完整的TypeScript类型定义
- **代码质量**: ESLint + Prettier

## 🎨 设计原则

- **简洁友好**: 适合语言学习的简洁界面
- **视觉反馈**: 考拉角色提供清晰的状态反馈
- **响应式**: 适配各种屏幕尺寸
- **可访问性**: 支持键盘导航和屏幕阅读器

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题或建议，请提交Issue。

---

**享受学习英语的乐趣！🎉**
