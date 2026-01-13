# 🔑 API 配置清单

## 📋 所有 API 服务总览

| 服务类型 | 提供商 | 用途 | 是否必需 | 配置位置 |
|---------|--------|------|---------|---------|
| AI 对话 | OpenAI / Anthropic / 豆包 | 生成 AI 回复 | ✅ 必需 | 设置 → AI 服务商 |
| 语音识别 (STT) | OpenAI Whisper | 高精度语音转文字 | ✅ 必需 | 设置 → STT 提供商 |
| 语音合成 (TTS) | OpenAI / Replicate / 浏览器 | 文字转语音播放 | ⚠️ 可选 | 设置 → TTS 提供商 |
| 发音评估 | Azure Speech | 发音准确度评估 | ⚠️ 可选 | 设置 → 发音评估 |

---

## 1️⃣ AI 对话服务（必需）

### 选项 A：OpenAI（推荐）

| 项目 | 内容 |
|------|------|
| **提供商** | OpenAI |
| **用途** | AI 对话生成 |
| **推荐模型** | `gpt-4o` 或 `gpt-4o-mini` |
| **API 端点** | `https://api.openai.com/v1/chat/completions` |
| **获取地址** | https://platform.openai.com/api-keys |
| **费用** | $0.005/1K tokens (gpt-4o-mini) |
| **配置步骤** | 1. 访问 OpenAI 官网<br>2. 注册账号<br>3. 充值（$5 起）<br>4. 创建 API Key<br>5. 在应用设置中粘贴 |
| **Key 格式** | `sk-proj-...` (以 sk-proj 开头) |
| **注意事项** | - 需要国际信用卡<br>- 需要科学上网<br>- Key 不要泄露 |

### 选项 B：Anthropic Claude

| 项目 | 内容 |
|------|------|
| **提供商** | Anthropic |
| **用途** | AI 对话生成 |
| **推荐模型** | `claude-3-5-sonnet-20241022` |
| **API 端点** | `https://api.anthropic.com/v1/messages` |
| **获取地址** | https://console.anthropic.com |
| **费用** | $3/1M tokens (输入) |
| **配置步骤** | 1. 访问 Anthropic 官网<br>2. 注册账号<br>3. 充值（$5 起）<br>4. 创建 API Key<br>5. 在应用设置中粘贴 |
| **Key 格式** | `sk-ant-...` |
| **优点** | - 对话质量最好<br>- 更自然流畅<br>- 上下文理解强 |

### 选项 C：豆包（国内）

| 项目 | 内容 |
|------|------|
| **提供商** | 字节跳动（豆包） |
| **用途** | AI 对话生成 |
| **推荐模型** | `doubao-pro-32k` |
| **API 端点** | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` |
| **获取地址** | https://console.volcengine.com/ark |
| **费用** | ¥0.008/1K tokens |
| **配置步骤** | 1. 访问火山引擎<br>2. 注册账号<br>3. 充值<br>4. 创建 API Key<br>5. 在应用设置中粘贴 |
| **优点** | - 国内访问快<br>- 无需科学上网<br>- 支持支付宝 |

---

## 2️⃣ 语音识别服务（必需）

### OpenAI Whisper

| 项目 | 内容 |
|------|------|
| **提供商** | OpenAI |
| **用途** | 语音转文字（高精度） |
| **模型** | `whisper-1` |
| **API 端点** | `https://api.openai.com/v1/audio/transcriptions` |
| **获取地址** | https://platform.openai.com/api-keys |
| **费用** | $0.006/分钟（约 ¥0.04/分钟） |
| **配置步骤** | 1. 使用与 AI 对话相同的 OpenAI API Key<br>2. 在设置中选择 "Whisper" 作为 STT 提供商 |
| **Key 格式** | `sk-proj-...` (与 AI 对话共用) |
| **优点** | - 识别准确度高<br>- 支持多语言<br>- 抗噪音能力强 |
| **注意事项** | - 与 AI 对话共用同一个 OpenAI API Key<br>- 无需单独配置 |

---

## 3️⃣ 语音合成服务（可选）

### 选项 A：OpenAI TTS（推荐）

| 项目 | 内容 |
|------|------|
| **提供商** | OpenAI |
| **用途** | 文字转语音（高质量） |
| **模型** | `tts-1-hd` (高清) 或 `tts-1` (标准) |
| **API 端点** | `https://api.openai.com/v1/audio/speech` |
| **获取地址** | https://platform.openai.com/api-keys |
| **费用** | $15/1M 字符 (HD) 或 $7.5/1M 字符 (标准) |
| **推荐音色** | `nova` (友好活泼) 或 `alloy` (中性自然) |
| **配置步骤** | 1. 使用与 AI 对话相同的 OpenAI API Key<br>2. 在设置中选择 "OpenAI TTS"<br>3. 选择音色和质量 |
| **Key 格式** | `sk-proj-...` (与 AI 对话共用) |
| **优点** | - 音质最好<br>- 最自然<br>- 延迟低 |
| **注意事项** | - 与 AI 对话共用同一个 OpenAI API Key<br>- 无需单独配置 |

### 选项 B：Replicate TTS

| 项目 | 内容 |
|------|------|
| **提供商** | Replicate |
| **用途** | 文字转语音（高质量） |
| **模型** | `turbo` (快速) 或 `standard` (标准) |
| **API 端点** | `https://api.replicate.com/v1/predictions` |
| **获取地址** | https://replicate.com/account/api-tokens |
| **费用** | 按使用量计费 |
| **配置步骤** | 1. 访问 Replicate 官网<br>2. 注册账号<br>3. 创建 API Token<br>4. 在应用设置中粘贴 |
| **Key 格式** | `r8_...` |
| **优点** | - 音质好<br>- 价格便宜 |
| **缺点** | - 延迟较高（1-3秒） |

### 选项 C：浏览器自带（免费）

| 项目 | 内容 |
|------|------|
| **提供商** | 浏览器 Web Speech API |
| **用途** | 文字转语音（基础） |
| **费用** | 完全免费 |
| **配置步骤** | 在设置中选择 "浏览器自带" |
| **优点** | - 完全免费<br>- 无需配置<br>- 即时播放<br>- 支持离线 |
| **缺点** | - 音质一般<br>- 机器感较强 |

---

## 4️⃣ 发音评估服务（可选）

### Azure Speech Service

| 项目 | 内容 |
|------|------|
| **提供商** | Microsoft Azure |
| **用途** | 发音准确度评估 |
| **API 端点** | `https://{region}.api.cognitive.microsoft.com/` |
| **获取地址** | https://portal.azure.com |
| **费用** | 免费额度：5 小时/月 |
| **配置步骤** | 1. 访问 Azure Portal<br>2. 创建 Speech Service 资源<br>3. 获取 Key 和 Region<br>4. 在应用设置中配置 |
| **需要配置** | - Azure Speech Key<br>- Azure Speech Region (如 `eastus`) |
| **优点** | - 专业发音评估<br>- 提供详细反馈<br>- 有免费额度 |
| **注意事项** | - 需要 Azure 账号<br>- 需要配置 Region |

---

## 🎯 推荐配置方案

### 方案 1：最简配置（仅必需服务）

| 服务 | 选择 | API Key | 费用 |
|------|------|---------|------|
| AI 对话 | OpenAI (gpt-4o-mini) | 1 个 OpenAI Key | ~$5/月 |
| 语音识别 | OpenAI Whisper | 共用上面的 Key | 包含在上面 |
| 语音合成 | 浏览器自带 | 无需 Key | 免费 |
| 发音评估 | 不启用 | 无需 Key | 免费 |

**总费用**：约 $5/月（轻度使用）

---

### 方案 2：推荐配置（最佳体验）

| 服务 | 选择 | API Key | 费用 |
|------|------|---------|------|
| AI 对话 | OpenAI (gpt-4o) | 1 个 OpenAI Key | ~$10/月 |
| 语音识别 | OpenAI Whisper | 共用上面的 Key | 包含在上面 |
| 语音合成 | OpenAI TTS (HD) | 共用上面的 Key | 包含在上面 |
| 发音评估 | Azure Speech | 1 个 Azure Key | 免费额度 |

**总费用**：约 $10/月（中度使用）

---

### 方案 3：顶级配置（最佳质量）

| 服务 | 选择 | API Key | 费用 |
|------|------|---------|------|
| AI 对话 | Anthropic Claude 3.5 | 1 个 Anthropic Key | ~$15/月 |
| 语音识别 | OpenAI Whisper | 1 个 OpenAI Key | ~$5/月 |
| 语音合成 | OpenAI TTS (HD) | 共用上面的 Key | 包含在上面 |
| 发音评估 | Azure Speech | 1 个 Azure Key | 免费额度 |

**总费用**：约 $20/月（重度使用）

---

## 📝 配置步骤总结

### 第一步：获取 API Keys

1. **OpenAI API Key**（必需）
   - 访问：https://platform.openai.com/api-keys
   - 注册 → 充值 → 创建 Key
   - 格式：`sk-proj-...`

2. **Anthropic API Key**（可选，如果想用 Claude）
   - 访问：https://console.anthropic.com
   - 注册 → 充值 → 创建 Key
   - 格式：`sk-ant-...`

3. **Azure Speech Key**（可选，如果想要发音评估）
   - 访问：https://portal.azure.com
   - 创建 Speech Service → 获取 Key 和 Region

### 第二步：在应用中配置

1. 打开应用：http://localhost:3000
2. 点击右上角"设置"按钮 ⚙️
3. 配置各项服务：

#### AI 对话设置
- **AI 服务商**：选择 OpenAI / Anthropic / 豆包
- **API Key**：粘贴你的 Key
- **API 端点**：自动填充（或手动输入）
- **模型**：选择推荐模型
- **系统提示词**：保持默认或自定义

#### 语音识别设置
- **STT 提供商**：选择 Whisper
- **OpenAI API Key**：与 AI 对话共用

#### 语音合成设置
- **TTS 提供商**：选择 OpenAI TTS / Replicate / 浏览器自带
- **OpenAI API Key**：与 AI 对话共用（如果选 OpenAI TTS）
- **Replicate API Key**：单独配置（如果选 Replicate）
- **音色**：选择喜欢的音色
- **质量**：选择 HD 或标准

#### 发音评估设置（可选）
- **启用发音评估**：打开开关
- **Azure Speech Key**：粘贴你的 Key
- **Azure Speech Region**：输入 Region（如 `eastus`）
- **用户水平**：选择 beginner / intermediate / advanced

4. 点击"保存设置"

### 第三步：测试

1. 点击"开始对话"
2. 按住按钮说话
3. 松开按钮
4. 验证：
   - ✅ 语音识别正确
   - ✅ AI 回复合理
   - ✅ TTS 播放声音
   - ✅ 发音评估显示（如果启用）

---

## ⚠️ 重要注意事项

### 安全性

1. **不要泄露 API Key**
   - 不要在公开场合分享
   - 不要提交到 Git 仓库
   - 定期更换 Key

2. **API Key 存储**
   - 应用将 Key 保存在浏览器本地存储
   - 不会上传到任何服务器
   - 只有你的浏览器能访问

3. **如果 Key 泄露**
   - 立即访问对应平台
   - 撤销旧 Key
   - 生成新 Key
   - 在应用中更新

### 费用控制

1. **设置使用限额**
   - OpenAI：https://platform.openai.com/account/billing/limits
   - Anthropic：https://console.anthropic.com/settings/limits

2. **监控使用量**
   - 定期查看账单
   - 设置预算提醒

3. **优化使用**
   - 使用 gpt-4o-mini 而不是 gpt-4o（便宜 10 倍）
   - 使用标准 TTS 而不是 HD（便宜 2 倍）
   - 只在需要时启用发音评估

---

## 🔍 故障排查

### 问题 1：API Key 无效

**症状**：
- 提示 "Invalid API Key"
- 401 Unauthorized 错误

**解决方案**：
1. 检查 Key 是否正确复制（没有多余空格）
2. 检查 Key 是否过期
3. 检查账户是否有余额
4. 重新生成 Key

### 问题 2：API 端点错误

**症状**：
- 提示 "API endpoint error"
- 404 Not Found 错误

**解决方案**：
1. 检查 API 端点是否正确
2. OpenAI：`https://api.openai.com/v1/chat/completions`
3. Anthropic：`https://api.anthropic.com/v1/messages`
4. 确保端点与 Key 匹配

### 问题 3：模型不匹配

**症状**：
- 提示 "Model not found"
- 使用 OpenAI Key 但配置了 Claude 端点

**解决方案**：
1. 确保 API Key、端点、模型三者匹配
2. OpenAI Key → OpenAI 端点 → OpenAI 模型
3. Anthropic Key → Anthropic 端点 → Claude 模型

### 问题 4：网络问题

**症状**：
- 提示 "Network error"
- 请求超时

**解决方案**：
1. 检查网络连接
2. 检查是否需要科学上网（OpenAI、Anthropic）
3. 尝试切换网络
4. 查看浏览器控制台错误日志

---

## 📞 获取帮助

如果遇到配置问题：

1. 查看浏览器控制台（F12 → Console）
2. 查看错误日志
3. 参考相关文档：
   - OpenAI TTS：`OpenAI_TTS_完整指南.md`
   - Whisper：`WHISPER_使用指南.md`
   - Replicate：`REPLICATE_TTS_GUIDE.md`
   - Azure：`AZURE_PRONUNCIATION_FEATURE.md`

---

**更新时间**：2026-01-12  
**版本**：v1.0  
**状态**：✅ 完整配置清单
