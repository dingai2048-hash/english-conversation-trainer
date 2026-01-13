import { useState } from "react"
import { Home, Clock, FileText, Settings, Menu, X, ChevronLeft, ChevronRight, Mic, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

const sceneCards = [
  {
    id: 1,
    title: "日常生活",
    image: "/cute-koala-cartoon-character-in-cozy-living-room-w.jpg",
  },
  {
    id: 2,
    title: "工作学习",
    image: "/cute-koala-cartoon-character-studying-at-desk-in-c.jpg",
  },
  {
    id: 3,
    title: "旅行探险",
    image: "/cute-koala-cartoon-character-hiking-in-mountains-a.jpg",
  },
  {
    id: 4,
    title: "运动健身",
    image: "/cute-koala-cartoon-character-exercising-gym-workou.jpg",
  },
  {
    id: 5,
    title: "社交聚会",
    image: "/cute-koala-cartoon-character-at-party-with-decorat.jpg",
  },
]

const historyRecords = [
  { date: "2026-01-07", time: "12:43:19", title: "听为练习", messages: 3 },
  { date: "2026-01-07", time: "12:30:21", title: "对话练习", messages: 2 },
  { date: "2026-01-07", time: "11:36:01", title: "对话练习", messages: 3 },
  { date: "2026-01-07", time: "11:35:59", title: "对话练习", messages: 2 },
  { date: "2026-01-07", time: "11:34:43", title: "练习认出声音和口音。", messages: 21 },
]

const chatMessages = [
  { id: 1, type: "user", text: "Hello, world start!" },
  { id: 2, type: "assistant", text: "Hello, Waiting, your house!" },
  { id: 3, type: "user", text: "What our answer?" },
]

export function EnglishPracticeApp() {
  const [showHistory, setShowHistory] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [translateEnabled, setTranslateEnabled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState("home")

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 2)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-sky-100">
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm">
              <img
                src="/cute-koala-mascot-head-with-glasses-cartoon.jpg"
                alt="Koala mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800">英语对话训练</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium",
                showHistory
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "bg-white/80 text-gray-600 hover:bg-white shadow-sm",
              )}
            >
              <Clock className="w-5 h-5" />
              <span>历史</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 text-gray-600 hover:bg-white shadow-sm transition-all font-medium">
              <Settings className="w-5 h-5" />
              <span>设置</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 px-6 pb-6 gap-5 overflow-hidden">
          {/* History Sidebar */}
          {showHistory && (
            <aside className="w-72 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg flex flex-col border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">历史记录</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 mb-4 border border-blue-100/50">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-base">📊</span>
                  <span>
                    总会话: <span className="font-semibold">7</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                  <span className="text-base">😊</span>
                  <span>
                    总消息: <span className="font-semibold">69</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                  <span className="text-base">🏆</span>
                  <span>
                    练习天数: <span className="font-semibold">1</span>
                  </span>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {historyRecords.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100/50 hover:border-blue-100"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                      <span className="font-medium">{record.date}</span>
                      <span>{record.time}</span>
                    </div>
                    <div className="font-medium text-gray-800 text-sm">{record.title}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{record.messages} 条消息</span>
                      <span className="text-gray-300 text-lg">😊</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <div className="flex-1 flex flex-col items-center justify-center relative">
            <p className="text-gray-500 mb-6 text-lg">与AI考拉练习英语口语</p>

            {/* Koala Image */}
            <div className="w-72 h-72 mb-6 relative">
              <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-3xl" />
              <img
                src="/cute-3d-koala-character-with-round-glasses-and-sus.jpg"
                alt="Koala Teacher"
                className="w-full h-full object-contain relative z-10 drop-shadow-lg"
              />
            </div>

            <h2 className="text-4xl font-bold text-gray-800 mb-2">Koala Teacher</h2>
            <p className="text-gray-500 text-lg mb-10">Your English Practice Partner</p>

            {/* Microphone Button */}
            <button className="relative group mb-4">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity scale-150" />
              <div className="absolute inset-0 bg-blue-300 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity scale-125" />
              <div className="relative w-32 h-32 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform border-4 border-white/30">
                <Mic className="w-12 h-12 text-white drop-shadow-md" />
              </div>
            </button>
            <p className="text-gray-700 font-medium text-lg">Tap to speak</p>
            <p className="text-gray-400 text-sm mt-1">点击麦克风开始对话</p>
          </div>

          <div className="w-[420px] flex flex-col gap-5">
            {/* Scene Cards Carousel */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-white/50">
              <div className="relative">
                <button
                  onClick={prevSlide}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 border border-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="overflow-hidden mx-4">
                  <div
                    className="flex gap-3 transition-transform duration-300"
                    style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                  >
                    {sceneCards.map((card) => (
                      <div key={card.id} className="flex-shrink-0 w-[100px] cursor-pointer group">
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all border-2 border-transparent group-hover:border-blue-200">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-center text-sm text-gray-700 mt-2 font-medium">{card.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={nextSlide}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 border border-gray-100"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chat Record */}
            <div className="flex-1 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg flex flex-col border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">对话记录</h3>
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
                  <Languages className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">中文翻译:</span>
                  <span className="text-sm text-gray-500 font-medium">{translateEnabled ? "开" : "关"}</span>
                  <Switch checked={translateEnabled} onCheckedChange={setTranslateEnabled} className="scale-90" />
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <h4 className="text-3xl font-bold text-gray-800 mb-3">Start a conversation!</h4>
                <p className="text-gray-400 text-lg">Click the microphone to begin speaking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src="/cute-koala-mascot-head-with-glasses-cartoon.jpg"
                alt="Koala mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg font-bold text-gray-800">英语对话训练</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 px-4 pb-24 overflow-y-auto">
          {/* Scene Cards Carousel */}
          <div className="py-4">
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {sceneCards.map((card) => (
                <div key={card.id} className="flex-shrink-0 w-28">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={card.image || "/placeholder.svg"}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-700 mt-2">{card.title}</p>
                </div>
              ))}
            </div>
            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {[0, 1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className={cn("w-2 h-2 rounded-full transition-colors", dot === 0 ? "bg-gray-800" : "bg-gray-300")}
                />
              ))}
            </div>
          </div>

          {/* Koala Teacher Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 mb-4">
                <img
                  src="/cute-3d-koala-character-with-round-glasses-and-sus.jpg"
                  alt="Koala Teacher"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Koala Teacher</h2>
              <p className="text-gray-600 mb-4">Your English Practice Partner</p>

              {/* Microphone Button */}
              <button className="relative group">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mb-4">点击麦克风开始对话</p>

          {/* Chat Record */}
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">对话记录</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">中文翻译:</span>
                <span className="text-sm text-gray-600">{translateEnabled ? "开" : "关"}</span>
                <Switch checked={translateEnabled} onCheckedChange={setTranslateEnabled} className="scale-75" />
              </div>
            </div>

            <div className="space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex items-end gap-2", msg.type === "user" ? "flex-row-reverse" : "")}>
                  {msg.type === "assistant" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src="/cute-koala-mascot-head-with-glasses-cartoon.jpg"
                        alt="Koala"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {msg.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">👤</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl max-w-[70%]",
                      msg.type === "user" ? "bg-blue-50 text-gray-800" : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-sm mt-4">Start a conversation!</p>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center">
          {[
            { id: "home", icon: Home, label: "首页" },
            { id: "history", icon: Clock, label: "历史" },
            { id: "records", icon: FileText, label: "记录" },
            { id: "settings", icon: Settings, label: "设置" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === tab.id ? "text-blue-500" : "text-gray-400",
              )}
            >
              <tab.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
