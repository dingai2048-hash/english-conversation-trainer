# 🎬 添加考拉视频

## 快速指南

### 单个视频（简单）
```
1. 准备一个考拉动画视频
2. 重命名为：koala.mp4
3. 放到这个文件夹
4. 刷新浏览器
```

### 多个状态视频（推荐）
准备 4 个视频，对应不同状态：

```
koala.mp4              - 默认/待机
koala-listening.mp4    - 录音/倾听
koala-thinking.mp4     - 处理/思考
koala-speaking.mp4     - 说话/回复
```

## 视频要求
- **格式**：MP4 或 WebM
- **分辨率**：720x720 或 1080x1080
- **时长**：3-10 秒
- **大小**：< 5MB

## 视频来源
- AI 生成：Runway ML, Pika Labs
- 3D 软件：Blender（免费）
- 购买素材：VideoHive, Pond5

## 后备机制
```
视频 → 图片 (koala.png) → Emoji (🐨)
```

如果视频加载失败，会自动降级到图片或 emoji。

## 测试
访问：http://localhost:3000/koala.mp4
能看到视频就说明成功了！

详细指南请查看：`KOALA_VIDEO_GUIDE.md`
