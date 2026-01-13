# 对话历史功能说明

## 功能概述

对话历史功能可以自动保存您的英语练习对话，并提供统计分析和历史记录查看功能。

## 主要特性

### 1. 自动保存
- ✅ 当对话达到2条消息（一问一答）时自动保存
- ✅ 使用2秒延迟避免频繁保存
- ✅ AI自动生成中文摘要（5-10个字）
- ✅ 即使摘要生成失败也会保存对话

### 2. 历史记录查看
- 📊 显示统计信息：
  - 总会话数
  - 总消息数
  - 练习天数
- 📝 显示最近20条会话记录
- 🕐 每条记录包含：
  - 日期和时间
  - AI生成的对话摘要
  - 消息数量

### 3. 数据管理
- 💾 自动保存到浏览器本地存储（localStorage）
- 📥 支持导出历史记录为JSON文件
- 🗑️ 最多保存最近100个会话
- 🔄 数据持久化，刷新页面不丢失

## 使用方法

### 查看历史记录

1. 点击页面右上角的"历史"按钮
2. 侧边栏会显示您的对话历史
3. 可以看到统计信息和最近的会话列表

### 导出历史记录

1. 打开历史记录侧边栏
2. 滚动到底部
3. 点击"📥 导出历史记录"按钮
4. 文件会自动下载为 `conversation-history-YYYY-MM-DD.json`

### 关闭历史记录

- 点击侧边栏右上角的 ✕ 按钮
- 或再次点击"历史"按钮

## 数据结构

每个会话包含以下信息：

```typescript
{
  id: string;              // 唯一标识符
  date: string;            // 日期 (YYYY-MM-DD)
  time: string;            // 时间 (HH:MM:SS)
  messages: Message[];     // 对话消息列表
  summary?: string;        // AI生成的摘要
  duration?: number;       // 对话时长（秒）
  messageCount: number;    // 消息数量
}
```

## 技术实现

### ConversationHistoryService

提供以下方法：

- `saveSession(messages, summary?)` - 保存会话
- `getAllSessions()` - 获取所有会话
- `getSession(sessionId)` - 获取特定会话
- `getRecentSessions(limit)` - 获取最近的会话
- `deleteSession(sessionId)` - 删除会话
- `clearAll()` - 清空所有历史
- `getStatistics()` - 获取统计信息
- `exportHistory()` - 导出历史记录
- `generateSummaryPrompt(messages)` - 生成摘要提示词

### 自动保存逻辑

```typescript
useEffect(() => {
  if (messages.length >= 2) {
    const saveConversation = async () => {
      try {
        const summaryPrompt = ConversationHistoryService.generateSummaryPrompt(messages);
        const summary = await aiServiceRef.current.sendMessage(summaryPrompt, []);
        ConversationHistoryService.saveSession(messages, summary);
      } catch (err) {
        // 即使摘要生成失败，也保存对话
        ConversationHistoryService.saveSession(messages);
      }
    };
    
    const timeoutId = setTimeout(saveConversation, 2000);
    return () => clearTimeout(timeoutId);
  }
}, [messages]);
```

## 隐私说明

- 所有数据仅保存在您的浏览器本地存储中
- 不会上传到任何服务器
- 清除浏览器数据会删除历史记录
- 建议定期导出重要的对话记录

## 注意事项

1. **存储限制**：浏览器localStorage通常有5-10MB的限制
2. **自动清理**：超过100个会话时，会自动删除最旧的会话
3. **隐私模式**：在浏览器隐私模式下，关闭窗口后数据会丢失
4. **备份建议**：重要对话请及时导出备份

## 未来计划

- [ ] 点击历史记录查看完整对话内容
- [ ] 搜索和筛选历史记录
- [ ] 按日期、话题分类
- [ ] 导入历史记录功能
- [ ] 学习进度分析和可视化
- [ ] 词汇统计和复习提醒

## 故障排除

### 历史记录不显示

1. 检查是否有至少2条消息的对话
2. 等待2秒让自动保存完成
3. 刷新页面重试

### 导出失败

1. 检查浏览器是否允许下载
2. 确保有足够的磁盘空间
3. 尝试使用其他浏览器

### 数据丢失

1. 检查是否清除了浏览器数据
2. 确认不是在隐私模式下使用
3. 定期导出备份以防数据丢失
