# 如何更换考拉图片

## 快速指南

### 方法 1：使用自己的图片（推荐）

1. **准备图片**
   - 找一张你喜欢的考拉图片
   - 建议尺寸：500x500 像素或更大
   - 格式：PNG（推荐，支持透明背景）或 JPG

2. **重命名图片**
   ```
   将你的图片重命名为：koala.png
   ```

3. **放到 public 文件夹**
   ```
   将 koala.png 复制到：
   english-conversation-trainer/public/koala.png
   ```

4. **刷新浏览器**
   - 保存文件后
   - 刷新浏览器（Cmd+R 或 Ctrl+R）
   - 新的考拉图片就会显示了！

### 方法 2：使用在线图片

如果你有在线图片的 URL：

1. 打开 `src/App.tsx`
2. 找到这些行（大约在第 280 行）：
   ```tsx
   <div className="w-full h-full relative z-10 flex items-center justify-center text-9xl">
     🐨
   </div>
   ```

3. 替换为：
   ```tsx
   <img 
     src="你的图片URL" 
     alt="Koala Teacher"
     className="w-full h-full object-contain"
   />
   ```

## 图片位置说明

项目中有 3 个地方使用了考拉图片：

### 1. 桌面端 - 中间大图（主要）
**位置**：`src/App.tsx` 第 280 行左右
```tsx
{/* Koala Image */}
<div className="w-72 h-72 mb-6 relative">
  <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-3xl" />
  <div className="w-full h-full relative z-10 flex items-center justify-center text-9xl">
    🐨  {/* ← 这里是考拉 emoji */}
  </div>
</div>
```

**改为使用图片**：
```tsx
{/* Koala Image */}
<div className="w-72 h-72 mb-6 relative">
  <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-3xl" />
  <img 
    src="/koala.png" 
    alt="Koala Teacher"
    className="w-full h-full relative z-10 object-contain drop-shadow-lg"
  />
</div>
```

### 2. 移动端 - 考拉卡片
**位置**：`src/App.tsx` 第 450 行左右
```tsx
<div className="w-48 h-48 mb-4 text-8xl flex items-center justify-center">
  🐨  {/* ← 这里是考拉 emoji */}
</div>
```

**改为使用图片**：
```tsx
<div className="w-48 h-48 mb-4">
  <img 
    src="/koala.png" 
    alt="Koala Teacher"
    className="w-full h-full object-contain"
  />
</div>
```

### 3. 对话记录中的头像
**位置**：`src/App.tsx` 第 370 行和第 500 行左右
```tsx
<div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xl">
  🐨  {/* ← 这里是考拉 emoji */}
</div>
```

**改为使用图片**：
```tsx
<div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white">
  <img 
    src="/koala.png" 
    alt="Koala"
    className="w-full h-full object-cover"
  />
</div>
```

## 推荐的图片规格

### 主要考拉图片（中间大图）
- **尺寸**：500x500 到 1000x1000 像素
- **格式**：PNG（透明背景最佳）
- **风格**：卡通、可爱、友好
- **建议**：正面或 3/4 侧面，有眼神交流

### 头像图片（对话中）
- 会自动缩放，使用同一张图片即可
- 圆形裁剪，注意主体居中

## 图片来源建议

### 免费图片网站
1. **Unsplash** - https://unsplash.com/s/photos/koala
2. **Pexels** - https://www.pexels.com/search/koala/
3. **Pixabay** - https://pixabay.com/images/search/koala/

### AI 生成
使用 AI 工具生成可爱的考拉：
- DALL-E
- Midjourney
- Stable Diffusion

提示词示例：
```
"cute cartoon koala character, friendly expression, 
wearing glasses, teacher style, white background, 
3D render, Pixar style"
```

## 故障排除

### 图片不显示
1. **检查文件路径**
   - 确保图片在 `public/koala.png`
   - 路径区分大小写

2. **清除缓存**
   - 硬刷新：Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
   - 或者清除浏览器缓存

3. **检查文件格式**
   - 确保是 PNG 或 JPG 格式
   - 文件名正确（koala.png）

### 图片显示不完整
- 检查图片尺寸是否合适
- 调整 `object-contain` 或 `object-cover` 类

### 图片太大/太小
修改容器尺寸：
```tsx
{/* 调整这里的 w-72 h-72 */}
<div className="w-72 h-72 mb-6 relative">
```

## 快速测试

上传图片后，在浏览器中访问：
```
http://localhost:3000/koala.png
```

如果能看到图片，说明上传成功！

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台是否有错误
2. 确认图片文件确实在 public 文件夹中
3. 尝试使用不同的图片格式
