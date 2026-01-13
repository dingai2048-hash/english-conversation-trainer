# 🎬 考拉视频功能指南

## ✨ 功能概述

现在支持使用**视频**作为考拉角色！可以根据不同状态自动切换视频，让交互更生动。

### 支持的状态视频

1. **默认状态** - `koala.mp4`
   - 待机时播放
   - 循环播放

2. **录音状态** - `koala-listening.mp4`
   - 用户说话时播放
   - 可以是考拉竖起耳朵、专注倾听的动画

3. **思考状态** - `koala-thinking.mp4`
   - AI 处理时播放
   - 可以是考拉思考、眨眼的动画

4. **说话状态** - `koala-speaking.mp4`
   - AI 回复时播放
   - 可以是考拉张嘴说话的动画

## 🚀 快速开始

### 方法 1：使用单个视频（最简单）

1. **准备视频**
   - 找一个考拉的动画视频
   - 格式：MP4（推荐）或 WebM
   - 时长：3-10 秒（会循环播放）

2. **重命名并放置**
   ```bash
   # 重命名为
   koala.mp4
   
   # 放到这里
   english-conversation-trainer/public/koala.mp4
   ```

3. **刷新浏览器**
   - 视频会自动循环播放
   - 如果视频加载失败，会自动降级到图片或 emoji

### 方法 2：使用多个状态视频（推荐）

准备 4 个不同的视频，对应不同状态：

```bash
public/
├── koala.mp4              # 默认/待机状态
├── koala-listening.mp4    # 录音/倾听状态
├── koala-thinking.mp4     # 处理/思考状态
└── koala-speaking.mp4     # 说话/回复状态
```

系统会根据当前状态自动切换视频！

## 📹 视频规格建议

### 基本要求
- **格式**：MP4（H.264 编码）或 WebM
- **分辨率**：720x720 到 1080x1080 像素
- **时长**：3-10 秒
- **帧率**：24-30 fps
- **文件大小**：< 5MB（建议压缩）

### 推荐设置
```
编码：H.264
分辨率：720x720
帧率：30fps
比特率：1-2 Mbps
音频：无（或静音）
```

### 优化建议
1. **压缩视频**
   - 使用 HandBrake: https://handbrake.fr/
   - 或在线工具: https://www.freeconvert.com/video-compressor

2. **转换格式**
   - 推荐 MP4（兼容性最好）
   - 备选 WebM（文件更小）

3. **循环优化**
   - 确保视频首尾能无缝衔接
   - 避免突然的跳跃

## 🎨 视频内容建议

### 默认状态 (koala.mp4)
**场景**：考拉在等待用户
**动作**：
- 轻微呼吸动作
- 偶尔眨眼
- 友好的表情
- 可以有轻微的摇摆

**示例提示词（AI 生成）**：
```
cute 3D koala character, idle animation, 
gentle breathing, occasional blinking, 
friendly expression, slight swaying, 
loop animation, Pixar style
```

### 录音状态 (koala-listening.mp4)
**场景**：考拉在认真倾听
**动作**：
- 耳朵竖起或转动
- 专注的眼神
- 头部轻微倾斜
- 表现出专注

**示例提示词**：
```
cute 3D koala character, listening animation,
ears perked up, attentive expression,
head tilted slightly, focused eyes,
loop animation, Pixar style
```

### 思考状态 (koala-thinking.mp4)
**场景**：考拉在思考回答
**动作**：
- 眼睛向上看
- 手托下巴
- 思考的表情
- 可以有问号或灯泡特效

**示例提示词**：
```
cute 3D koala character, thinking animation,
looking up, hand on chin, thoughtful expression,
question mark or lightbulb effect,
loop animation, Pixar style
```

### 说话状态 (koala-speaking.mp4)
**场景**：考拉在说话
**动作**：
- 嘴巴开合
- 生动的表情
- 手势动作
- 友好的眼神

**示例提示词**：
```
cute 3D koala character, speaking animation,
mouth moving, expressive face, hand gestures,
friendly eyes, animated talking,
loop animation, Pixar style
```

## 🛠️ 技术实现

### 自动状态切换
代码会自动检测状态并切换视频：

```typescript
if (isRecording) {
  // 播放 koala-listening.mp4
} else if (isProcessing) {
  // 播放 koala-thinking.mp4
} else if (isSpeaking) {
  // 播放 koala-speaking.mp4
} else {
  // 播放 koala.mp4
}
```

### 智能降级
```
视频 → 图片 → Emoji
```

如果视频加载失败，会自动尝试：
1. 显示 `koala.png` 图片
2. 如果图片也失败，显示 🐨 emoji

### 视频属性
- `autoPlay` - 自动播放
- `loop` - 循环播放
- `muted` - 静音（避免干扰）
- `playsInline` - 移动端内联播放

## 📁 文件结构

```
english-conversation-trainer/
├── public/
│   ├── koala.mp4              ← 默认视频（必需）
│   ├── koala-listening.mp4    ← 录音视频（可选）
│   ├── koala-thinking.mp4     ← 思考视频（可选）
│   ├── koala-speaking.mp4     ← 说话视频（可选）
│   ├── koala.png              ← 图片后备
│   └── ...
└── src/
    └── App.tsx                ← 视频逻辑
```

## 🎬 视频来源

### 1. AI 生成（推荐）

**Runway ML**
- https://runwayml.com/
- 文本生成视频
- 高质量动画

**Pika Labs**
- https://pika.art/
- AI 视频生成
- 支持循环动画

**Leonardo.ai**
- https://leonardo.ai/
- 图片转视频
- 可控制动作

### 2. 3D 动画软件

**Blender**（免费）
- 创建 3D 考拉模型
- 制作动画
- 导出视频

**Cinema 4D**
- 专业 3D 动画
- 高质量渲染

### 3. 在线动画工具

**Animaker**
- https://www.animaker.com/
- 在线动画制作
- 简单易用

**Vyond**
- https://www.vyond.com/
- 商业动画工具

### 4. 购买现成素材

**VideoHive**
- https://videohive.net/
- 搜索 "koala animation"
- 专业质量

**Pond5**
- https://www.pond5.com/
- 大量动物动画

## 🧪 测试视频

### 方法 1：浏览器直接访问
```
http://localhost:3000/koala.mp4
```

### 方法 2：检查控制台
打开浏览器控制台（F12），查看是否有视频加载错误。

### 方法 3：查看网络请求
在开发者工具的 Network 标签中，筛选视频文件，查看加载状态。

## 🐛 故障排除

### 问题 1：视频不播放
**可能原因**：
- 文件格式不支持
- 文件路径错误
- 浏览器自动播放限制

**解决方案**：
1. 确认文件是 MP4 格式
2. 检查文件名是否正确（小写）
3. 尝试用户交互后播放

### 问题 2：视频卡顿
**原因**：文件太大
**解决方案**：
- 压缩视频
- 降低分辨率
- 减少比特率

### 问题 3：视频不循环
**检查**：
- 视频是否有 `loop` 属性
- 视频首尾是否能无缝衔接

### 问题 4：移动端不显示
**原因**：移动端限制
**解决方案**：
- 确保有 `playsInline` 属性
- 视频必须静音（`muted`）
- 文件大小要小

### 问题 5：状态切换不流畅
**优化**：
- 预加载所有视频
- 使用更短的视频
- 优化视频编码

## 💡 高级技巧

### 1. 预加载视频
在页面加载时预加载所有视频：

```html
<link rel="preload" href="/koala.mp4" as="video">
<link rel="preload" href="/koala-listening.mp4" as="video">
<link rel="preload" href="/koala-thinking.mp4" as="video">
<link rel="preload" href="/koala-speaking.mp4" as="video">
```

### 2. 添加过渡效果
在视频切换时添加淡入淡出：

```css
video {
  transition: opacity 0.3s ease-in-out;
}
```

### 3. 响应式视频
根据屏幕大小使用不同质量：

```tsx
<video>
  <source src="/koala-hd.mp4" media="(min-width: 1024px)">
  <source src="/koala-sd.mp4">
</video>
```

### 4. 添加音效
虽然视频静音，但可以单独添加音效：

```typescript
const playSound = (soundFile: string) => {
  const audio = new Audio(soundFile);
  audio.play();
};
```

## 📊 性能优化

### 文件大小建议
- 默认视频：< 3MB
- 状态视频：< 2MB 每个
- 总大小：< 10MB

### 加载策略
1. **优先加载默认视频**
2. **懒加载状态视频**
3. **使用 CDN 加速**

### 压缩技巧
```bash
# 使用 FFmpeg 压缩
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 1M output.mp4

# 调整分辨率
ffmpeg -i input.mp4 -vf scale=720:720 output.mp4

# 减少帧率
ffmpeg -i input.mp4 -r 24 output.mp4
```

## 🎯 最佳实践

1. **保持简洁**
   - 视频时长 3-5 秒最佳
   - 动作清晰明确

2. **优化性能**
   - 压缩文件大小
   - 使用合适的分辨率

3. **测试兼容性**
   - 在不同浏览器测试
   - 在移动设备测试

4. **提供后备**
   - 始终准备图片后备
   - emoji 作为最终后备

5. **用户体验**
   - 确保视频循环流畅
   - 避免突兀的切换

## 🎨 创意想法

### 主题视频
- **节日主题**：圣诞帽、新年装饰
- **季节主题**：春夏秋冬不同装扮
- **情绪主题**：开心、鼓励、庆祝

### 互动效果
- 点击考拉触发特殊动画
- 长时间无操作播放"打瞌睡"动画
- 完成对话播放"庆祝"动画

### 彩蛋
- 特定时间播放特殊视频
- 连续对话次数达到里程碑时的特效
- 随机播放稀有动画

## 📞 需要帮助？

如果遇到问题：
1. 检查浏览器控制台错误
2. 确认视频文件格式和路径
3. 测试视频是否能单独播放
4. 查看网络请求状态

## 🎉 开始使用

1. 准备一个考拉视频（或多个）
2. 重命名为 `koala.mp4`（及其他状态视频）
3. 放到 `public` 文件夹
4. 刷新浏览器

享受动态的考拉老师吧！🎬🐨✨
