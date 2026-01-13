# Gemma 2 27B 配置指南

本指南将帮助你通过 Replicate 使用 Gemma 2 27B 模型进行英语对话训练。

## 🎯 为什么选择 Gemma 2 27B？

- **开源免费**：Google 开源的高质量模型
- **性能优秀**：27B 参数，对话质量接近 GPT-3.5
- **成本低廉**：通过 Replicate 托管，约 $0.0001/token
- **响应快速**：优化的推理速度，适合实时对话

## ✅ 功能状态

**Replicate API 集成已完成！** 现在可以正常使用 Gemma 2 27B 进行对话。

## 📋 配置步骤

### 1. 获取 Replicate API Key

1. 访问 [Replicate.com](https://replicate.com)
2. 点击右上角 "Sign up" 注册账号（可以用 GitHub 登录）
3. 登录后，点击右上角头像 → "Account Settings"
4. 在左侧菜单选择 "API tokens"
5. 点击 "Create token" 创建新的 API Token
6. 复制生成的 Token（格式：`r8_xxxxxxxxxxxxx`）

**重要**：Replicate 新用户通常有免费额度，可以先测试使用。

### 2. 在应用中配置

1. 打开应用：http://localhost:3000
2. 点击右上角"设置"按钮
3. 在"选择 AI 服务商"下拉菜单中选择 **"Replicate (Gemma 2)"**
4. 在"API Key"输入框粘贴你的 Replicate Token
5. 在"选择模型"下拉菜单中选择：
   - **meta/gemma-2-27b-it** (推荐) - 27B 参数，最强性能
   - **meta/gemma-2-9b-it** - 9B 参数，更快速度
   - **meta/llama-2-70b-chat** - Llama 2 70B，备选方案
6. 点击"保存设置"

### 3. 开始使用

配置完成后：
1. 点击麦克风按钮开始录音
2. 说英语句子
3. AI 会用 Gemma 2 27B 回复你
4. 享受高质量的英语对话练习！

## 💰 费用说明

### Replicate 定价

- **Gemma 2 27B**: 约 $0.0001 per token
- **输入 token**: 计费
- **输出 token**: 计费

### 实际成本估算

假设每次对话：
- 用户输入：10 个单词 ≈ 15 tokens
- AI 回复：20 个单词 ≈ 30 tokens
- 总计：45 tokens per 对话

**每次对话成本**：45 × $0.0001 = **$0.0045** (约 ¥0.03)

**每天练习 30 分钟**（约 30 次对话）：
- 每天：30 × $0.0045 = **$0.135** (约 ¥1)
- 每月：$0.135 × 30 = **$4.05** (约 ¥30)

### 与其他服务对比

| 服务 | 模型 | 每月成本 (30分钟/天) |
|------|------|---------------------|
| OpenAI | GPT-3.5 Turbo | ~$10-15 |
| OpenAI | GPT-4 | ~$50-100 |
| Replicate | Gemma 2 27B | ~$4 |
| 豆包 | Doubao Pro | ~¥20-30 |

**Gemma 2 27B 性价比最高！** 💰

## 🎨 模型选择建议

### Gemma 2 27B IT (推荐)

- **优点**：
  - 对话质量高，理解能力强
  - 支持长上下文（8K tokens）
  - 响应自然流畅
  - 适合英语教学场景
- **缺点**：
  - 速度稍慢（约 2-3 秒响应）
  - 成本稍高
- **适合**：追求质量的用户

### Gemma 2 9B IT

- **优点**：
  - 响应速度快（约 1-2 秒）
  - 成本更低（约 $0.00005/token）
  - 对话质量仍然不错
- **缺点**：
  - 理解能力略弱于 27B
  - 复杂对话可能不够准确
- **适合**：追求速度和成本的用户

### Llama 2 70B Chat

- **优点**：
  - 参数最大，理解能力最强
  - Meta 官方模型，稳定可靠
- **缺点**：
  - 响应较慢（约 3-5 秒）
  - 成本较高（约 $0.0002/token）
- **适合**：对质量要求极高的用户

## 🔧 高级配置

### 自定义 System Prompt

在设置中展开"AI 对话风格设置"，可以自定义 System Prompt 来调整 AI 的行为：

```
You are Koala, a friendly English teacher using Gemma 2 27B.
Keep responses simple and encouraging.
Focus on practical conversation practice.
```

### 调整对话参数

如果你想调整温度、top_p 等参数，可以：

1. 修改 `src/services/AIConversationService.ts`
2. 在 API 请求中添加参数：
```typescript
{
  temperature: 0.7,  // 创造性 (0-1)
  top_p: 0.9,        // 多样性 (0-1)
  max_tokens: 150,   // 最大回复长度
}
```

## ❓ 常见问题

### Q1: Replicate API 响应慢怎么办？

**原因**：冷启动（模型未加载）

**解决**：
1. 第一次请求会慢（10-30秒），之后会快很多
2. 考虑使用 Gemma 2 9B（更快）
3. 或者使用 Replicate 的 "warm pool" 功能（需付费）

### Q2: API Key 无效？

**检查**：
1. Token 格式正确（`r8_xxxxx`）
2. Token 未过期
3. Replicate 账号有余额

### Q3: 对话质量不好？

**优化**：
1. 调整 System Prompt
2. 尝试不同模型（27B vs 9B）
3. 检查网络连接

### Q4: 成本超出预期？

**控制成本**：
1. 使用 Gemma 2 9B（成本减半）
2. 缩短对话长度
3. 在 Replicate 设置预算限制

### Q5: 支持中文翻译吗？

**支持**！应用内置翻译功能：
1. 点击右上角"翻译"开关
2. AI 回复会自动显示中文翻译
3. 翻译也使用 Gemma 2 模型

### Q6: 如何验证 Replicate 配置成功？

**验证步骤**：
1. 配置好 API Key 和模型后，点击保存
2. 刷新页面
3. 点击麦克风说 "Hello"
4. 如果 AI 正常回复，说明配置成功
5. 第一次请求可能需要 10-30 秒（冷启动），之后会快很多

**如果出现错误**：
- 检查 API Key 是否正确（格式：`r8_xxxxx`）
- 检查 Replicate 账号是否有余额
- 打开浏览器控制台查看详细错误信息

## 🚀 性能优化建议

### 1. 减少延迟

- 使用 Gemma 2 9B 而非 27B
- 保持对话简短（每次 10-20 个单词）
- 避免复杂的 System Prompt

### 2. 降低成本

- 关闭翻译功能（减少 API 调用）
- 使用更小的模型
- 设置 max_tokens 限制

### 3. 提升质量

- 使用 Gemma 2 27B
- 优化 System Prompt
- 提供更多上下文

## 📚 相关资源

- [Replicate 官方文档](https://replicate.com/docs)
- [Gemma 2 模型介绍](https://ai.google.dev/gemma)
- [API 定价详情](https://replicate.com/pricing)
- [应用设置指南](./API_SETUP_GUIDE.md)

## 🎉 开始使用

现在你已经了解如何配置 Gemma 2 27B！

1. ✅ 获取 Replicate API Key
2. ✅ 在应用中配置
3. ✅ 选择合适的模型
4. ✅ 开始练习英语对话

祝你学习愉快！🚀

---

**提示**：如果遇到问题，可以先尝试 Mock 模式测试应用功能，确认一切正常后再配置真实 API。
