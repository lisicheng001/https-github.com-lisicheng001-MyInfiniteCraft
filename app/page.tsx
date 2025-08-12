"use client"

import { useState, useRef } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface Element {
  id: string
  name: string
  emoji: string
  discovered: boolean
  isNew?: boolean
}

interface CombinationResult {
  name: string
  emoji: string
  description?: string
}

export default function MyInfiniteCraftPage() {
  const [currentView, setCurrentView] = useState<"home" | "infinite-craft">("home")
  const [showGameModal, setShowGameModal] = useState(false)

  // Infinite Craft 游戏状态
  const [elements, setElements] = useState<Element[]>([
    { id: "water", name: "Water", emoji: "💧", discovered: true },
    { id: "fire", name: "Fire", emoji: "🔥", discovered: true },
    { id: "wind", name: "Wind", emoji: "💨", discovered: true },
    { id: "earth", name: "Earth", emoji: "🌍", discovered: true },
  ])

  const [workspaceElements, setWorkspaceElements] = useState<Element[]>([])
  const [discoveries, setDiscoveries] = useState(4)
  const [message, setMessage] = useState("Drag elements to the workspace to combine them!")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewDiscovery, setShowNewDiscovery] = useState<Element | null>(null)
  const [gameStats, setGameStats] = useState({
    totalDiscoveries: 4,
    sessionTime: 0,
    combinations: 0,
  })

  const timerRef = useRef<NodeJS.Timeout>()

  // 完整的组合规则
  const combinations: { [key: string]: CombinationResult } = {
    "water+fire": { name: "Steam", emoji: "💨" },
    "fire+water": { name: "Steam", emoji: "💨" },
    "water+earth": { name: "Plant", emoji: "🌱" },
    "earth+water": { name: "Plant", emoji: "🌱" },
    "fire+earth": { name: "Lava", emoji: "🌋" },
    "earth+fire": { name: "Lava", emoji: "🌋" },
    "wind+water": { name: "Wave", emoji: "🌊" },
    "water+wind": { name: "Wave", emoji: "🌊" },
    "wind+fire": { name: "Energy", emoji: "⚡" },
    "fire+wind": { name: "Energy", emoji: "⚡" },
    "wind+earth": { name: "Dust", emoji: "🌪️" },
    "earth+wind": { name: "Dust", emoji: "🌪️" },
    "steam+plant": { name: "Tea", emoji: "🍵" },
    "plant+steam": { name: "Tea", emoji: "🍵" },
    "lava+water": { name: "Stone", emoji: "🪨" },
    "water+lava": { name: "Stone", emoji: "🪨" },
    "plant+plant": { name: "Tree", emoji: "🌳" },
    "stone+fire": { name: "Metal", emoji: "⚙️" },
    "fire+stone": { name: "Metal", emoji: "⚙️" },
    "tree+fire": { name: "Ash", emoji: "🌫️" },
    "fire+tree": { name: "Ash", emoji: "🌫️" },
    "metal+fire": { name: "Tool", emoji: "🔨" },
    "fire+metal": { name: "Tool", emoji: "🔨" },
    "wave+wind": { name: "Storm", emoji: "⛈️" },
    "wind+wave": { name: "Storm", emoji: "⛈️" },
    "energy+water": { name: "Life", emoji: "🧬" },
    "water+energy": { name: "Life", emoji: "🧬" },
    "dust+water": { name: "Mud", emoji: "🟤" },
    "water+dust": { name: "Mud", emoji: "🟤" },
    "life+earth": { name: "Human", emoji: "👤" },
    "earth+life": { name: "Human", emoji: "👤" },
    "human+tool": { name: "Builder", emoji: "👷" },
    "tool+human": { name: "Builder", emoji: "👷" },
    "storm+water": { name: "Rain", emoji: "🌧️" },
    "water+storm": { name: "Rain", emoji: "🌧️" },
    "tree+tree": { name: "Forest", emoji: "🌲" },
    "stone+stone": { name: "Mountain", emoji: "⛰️" },
    "metal+metal": { name: "Machine", emoji: "🤖" },
    "ash+wind": { name: "Smoke", emoji: "💨" },
    "wind+ash": { name: "Smoke", emoji: "💨" },
    "mud+fire": { name: "Brick", emoji: "🧱" },
    "fire+mud": { name: "Brick", emoji: "🧱" },
    "human+fire": { name: "Cook", emoji: "👨‍🍳" },
    "fire+human": { name: "Cook", emoji: "👨‍🍳" },
    "human+water": { name: "Swimmer", emoji: "🏊" },
    "water+human": { name: "Swimmer", emoji: "🏊" },
    "human+wind": { name: "Pilot", emoji: "✈️" },
    "wind+human": { name: "Pilot", emoji: "✈️" },
    "human+earth": { name: "Farmer", emoji: "👨‍🌾" },
    "earth+human": { name: "Farmer", emoji: "👨‍🌾" },
    "builder+stone": { name: "Castle", emoji: "🏰" },
    "stone+builder": { name: "Castle", emoji: "🏰" },
    "machine+energy": { name: "Robot", emoji: "🤖" },
    "energy+machine": { name: "Robot", emoji: "🤖" },
    "forest+human": { name: "Ranger", emoji: "🧑‍🌲" },
    "human+forest": { name: "Ranger", emoji: "🧑‍🌲" },
    "rain+earth": { name: "Rainbow", emoji: "🌈" },
    "earth+rain": { name: "Rainbow", emoji: "🌈" },
    "storm+fire": { name: "Lightning", emoji: "⚡" },
    "fire+storm": { name: "Lightning", emoji: "⚡" },
    "water+mountain": { name: "River", emoji: "🏞️" },
    "mountain+water": { name: "River", emoji: "🏞️" },
    "wind+mountain": { name: "Avalanche", emoji: "🏔️" },
    "mountain+wind": { name: "Avalanche", emoji: "🏔️" },
    "plant+fire": { name: "Vegetable", emoji: "🥬" },
    "fire+plant": { name: "Vegetable", emoji: "🥬" },
    "vegetable+water": { name: "Soup", emoji: "🍲" },
    "water+vegetable": { name: "Soup", emoji: "🍲" },
    "plant+human": { name: "Salad", emoji: "🥗" },
    "human+plant": { name: "Salad", emoji: "🥗" },
    "cook+vegetable": { name: "Meal", emoji: "🍽️" },
    "vegetable+cook": { name: "Meal", emoji: "🍽️" },
    "life+water": { name: "Fish", emoji: "🐟" },
    "water+life": { name: "Fish", emoji: "🐟" },
    "life+wind": { name: "Bird", emoji: "🐦" },
    "wind+life": { name: "Bird", emoji: "🐦" },
    "life+earth": { name: "Animal", emoji: "🐾" },
    "earth+life": { name: "Animal", emoji: "🐾" },
    "animal+human": { name: "Pet", emoji: "🐕" },
    "human+animal": { name: "Pet", emoji: "🐕" },
    "metal+energy": { name: "Wire", emoji: "🔌" },
    "energy+metal": { name: "Wire", emoji: "🔌" },
    "wire+energy": { name: "Electricity", emoji: "💡" },
    "energy+wire": { name: "Electricity", emoji: "💡" },
    "electricity+human": { name: "Scientist", emoji: "👨‍🔬" },
    "human+electricity": { name: "Scientist", emoji: "👨‍🔬" },
    "scientist+metal": { name: "Computer", emoji: "💻" },
    "metal+scientist": { name: "Computer", emoji: "💻" },
    "human+stone": { name: "Sculpture", emoji: "🗿" },
    "stone+human": { name: "Sculpture", emoji: "🗿" },
    "human+plant": { name: "Garden", emoji: "🌺" },
    "plant+human": { name: "Garden", emoji: "🌺" },
    "human+fire": { name: "Light", emoji: "🕯️" },
    "fire+human": { name: "Light", emoji: "🕯️" },
    "light+human": { name: "Art", emoji: "🎨" },
    "human+light": { name: "Art", emoji: "🎨" },
    "castle+human": { name: "King", emoji: "👑" },
    "human+castle": { name: "King", emoji: "👑" },
    "king+forest": { name: "Kingdom", emoji: "🏛️" },
    "forest+king": { name: "Kingdom", emoji: "🏛️" },
    "computer+human": { name: "Programmer", emoji: "👨‍💻" },
    "human+computer": { name: "Programmer", emoji: "👨‍💻" },
    "robot+human": { name: "Cyborg", emoji: "🦾" },
    "human+robot": { name: "Cyborg", emoji: "🦾" },
    "fire+wind": { name: "Star", emoji: "⭐" },
    "wind+fire": { name: "Star", emoji: "⭐" },
    "star+star": { name: "Galaxy", emoji: "🌌" },
    "water+star": { name: "Planet", emoji: "🪐" },
    "star+water": { name: "Planet", emoji: "🪐" },
    "planet+life": { name: "Alien", emoji: "👽" },
    "life+planet": { name: "Alien", emoji: "👽" },
    "energy+human": { name: "Wizard", emoji: "🧙" },
    "human+energy": { name: "Wizard", emoji: "🧙" },
    "wizard+fire": { name: "Dragon", emoji: "🐉" },
    "fire+wizard": { name: "Dragon", emoji: "🐉" },
    "wizard+water": { name: "Potion", emoji: "🧪" },
    "water+wizard": { name: "Potion", emoji: "🧪" },
    "dragon+castle": { name: "Legend", emoji: "📜" },
    "castle+dragon": { name: "Legend", emoji: "📜" },
    "human+star": { name: "Time", emoji: "⏰" },
    "star+human": { name: "Time", emoji: "⏰" },
    "time+human": { name: "History", emoji: "📚" },
    "human+time": { name: "History", emoji: "📚" },
    "time+earth": { name: "Fossil", emoji: "🦕" },
    "earth+time": { name: "Fossil", emoji: "🦕" },
    "time+plant": { name: "Tree", emoji: "🌳" },
    "plant+time": { name: "Tree", emoji: "🌳" },
  }

  const handleInfiniteCraftClick = () => {
    setShowGameModal(true)
  }

  const startInfiniteCraft = () => {
    setCurrentView("infinite-craft")
    setShowGameModal(false)
    // 开始计时器
    timerRef.current = setInterval(() => {
      setGameStats((prev) => ({
        ...prev,
        sessionTime: prev.sessionTime + 1,
      }))
    }, 1000)
  }

  const backToHome = () => {
    setCurrentView("home")
    // 停止计时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    // 重置游戏状态
    setWorkspaceElements([])
    setMessage("Drag elements to the workspace to combine them!")
    setSearchTerm("")
    setShowNewDiscovery(null)
  }

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // 处理拖拽结束
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId === "elements" && destination.droppableId === "workspace") {
      const element = elements.find((el) => el.id === result.draggableId)
      if (element && workspaceElements.length < 4) {
        setWorkspaceElements((prev) => [...prev, { ...element, id: `${element.id}-${Date.now()}` }])
      }
    } else if (source.droppableId === "workspace" && destination.droppableId === "workspace") {
      const newWorkspaceElements = Array.from(workspaceElements)
      const [reorderedItem] = newWorkspaceElements.splice(source.index, 1)
      newWorkspaceElements.splice(destination.index, 0, reorderedItem)
      setWorkspaceElements(newWorkspaceElements)
    }
  }

  // 尝试组合元素
  const combineElements = () => {
    if (workspaceElements.length !== 2) {
      setMessage("Please place exactly 2 elements in the workspace to combine!")
      return
    }

    const [elem1, elem2] = workspaceElements
    const key1 = `${elem1.name.toLowerCase()}+${elem2.name.toLowerCase()}`
    const key2 = `${elem2.name.toLowerCase()}+${elem1.name.toLowerCase()}`

    const result = combinations[key1] || combinations[key2]

    setGameStats((prev) => ({
      ...prev,
      combinations: prev.combinations + 1,
    }))

    if (result) {
      const existingElement = elements.find((el) => el.name === result.name)

      if (!existingElement) {
        const newElement: Element = {
          id: result.name.toLowerCase().replace(/\s+/g, "-"),
          name: result.name,
          emoji: result.emoji,
          discovered: true,
          isNew: true,
        }

        setElements((prev) => [...prev, newElement])
        setDiscoveries((prev) => prev + 1)
        setGameStats((prev) => ({
          ...prev,
          totalDiscoveries: prev.totalDiscoveries + 1,
        }))
        setShowNewDiscovery(newElement)
        setMessage(`🎉 Amazing! You discovered ${result.emoji} ${result.name}!`)

        setTimeout(() => {
          setElements((prev) => prev.map((el) => (el.id === newElement.id ? { ...el, isNew: false } : el)))
          setShowNewDiscovery(null)
        }, 3000)
      } else {
        setMessage(`You already have ${result.emoji} ${result.name}. Try a different combination!`)
      }
    } else {
      setMessage(`${elem1.emoji} + ${elem2.emoji} = Nothing... Keep experimenting!`)
    }

    setTimeout(() => {
      setWorkspaceElements([])
      if (!result || elements.find((el) => el.name === result.name)) {
        setMessage("Drag elements to the workspace to combine them!")
      }
    }, 2000)
  }

  const clearWorkspace = () => {
    setWorkspaceElements([])
    setMessage("Workspace cleared! Drag elements to combine them!")
  }

  const filteredElements = elements.filter((element) => element.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const removeFromWorkspace = (index: number) => {
    setWorkspaceElements((prev) => prev.filter((_, i) => i !== index))
  }

  // 主页视图
  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Elegant light orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-400/15 via-purple-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>

          {/* Subtle floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-float delay-300"></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-emerald-400/60 rounded-full animate-float delay-700"></div>
          <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-float delay-1000"></div>
        </div>

        {/* Elegant grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

        <header className="relative z-10 bg-black/20 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center space-x-8 mb-8">
                <div className="relative group">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                    <div className="text-4xl">⚡</div>

                    {/* Elegant glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                    {/* Subtle corner accents */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100"></div>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    MyInfiniteCraft
                  </h1>
                  <div className="text-lg text-white/60 mt-2 font-medium">Create • Discover • Explore</div>
                </div>
              </div>
              <p className="text-xl md:text-2xl text-white/80 font-medium max-w-4xl mx-auto leading-relaxed">
                Welcome to the ultimate creative playground where imagination meets infinite possibilities.
                <br />
                <span className="text-blue-200">Click on a game to begin your journey.</span>
              </p>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                🎮 Amazing Games 🌟
              </h2>
              <p className="text-xl text-white/80 font-medium max-w-3xl mx-auto">
                🚀 Discover magical worlds of creativity and endless fun combinations! ✨
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div
                className="group relative cursor-pointer transform transition-all duration-500 hover:scale-110 hover:rotate-1"
                onClick={handleInfiniteCraftClick}
              >
                <div className="absolute -inset-6 bg-gradient-to-r from-pink-500/30 via-purple-500/30 via-blue-500/30 to-cyan-500/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                {/* Main card */}
                <div className="relative bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/30 shadow-2xl overflow-hidden">
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2 animate-bounce">
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                      <span>🎯 Ready to Play!</span>
                    </div>
                  </div>

                  <div className="relative text-center mb-8">
                    <div className="relative inline-block">
                      <div className="relative w-28 h-28 bg-gradient-to-br from-pink-500 via-purple-500 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
                        <div className="text-6xl animate-pulse">⚡</div>

                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                        <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200"></div>
                        <div className="absolute top-0 left-0 w-5 h-5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-400"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-600"></div>
                      </div>
                    </div>
                  </div>

                  {/* Game information */}
                  <div className="relative z-10 text-center">
                    <h3 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                      ⚡ Infinite Craft ✨
                    </h3>
                    <p className="text-white/80 mb-8 leading-relaxed text-lg font-medium">
                      🧪 Mix and match elements to create amazing new things! From simple water and fire to magical
                      creatures and cool inventions! 🌟
                    </p>

                    <div className="space-y-3 text-sm mb-8">
                      <div className="flex justify-between items-center bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl px-4 py-3 border-2 border-pink-400/40">
                        <span className="text-white font-bold">🎨 Type:</span>
                        <span className="text-pink-200 font-bold">Creative & Fun!</span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl px-4 py-3 border-2 border-blue-400/40">
                        <span className="text-white font-bold">👥 Players:</span>
                        <span className="text-cyan-200 font-bold">Just You!</span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl px-4 py-3 border-2 border-green-400/40">
                        <span className="text-white font-bold">⭐ Fun Level:</span>
                        <span className="text-green-200 font-bold">Super Easy!</span>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 transform group-hover:scale-110 shadow-2xl text-lg animate-pulse">
                      <span className="flex items-center justify-center space-x-3">
                        <span>🚀 Start Playing Now! 🎮</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="group relative transform transition-all duration-300 hover:scale-105 hover:rotate-1 opacity-70">
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-xl">
                  <div className="absolute top-6 right-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2 animate-bounce">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span>🔜 Coming Soon!</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="relative inline-block mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                        <span className="text-5xl animate-bounce">🎲</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                      🎲 Mystery Adventure
                    </h3>
                    <p className="text-white/60 mb-8 leading-relaxed font-medium">
                      🌟 A super cool new game is coming soon! Get ready for more fun! ✨
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl px-4 py-3 border-2 border-orange-400/40">
                        <span className="text-white/70 font-bold">📅 Status:</span>
                        <span className="text-orange-300 font-bold">Almost Ready!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative transform transition-all duration-300 hover:scale-105 hover:rotate-1 opacity-70">
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-xl">
                  <div className="absolute top-6 right-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2 animate-bounce">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span>🔜 Coming Soon!</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="relative inline-block mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                        <span className="text-5xl animate-bounce delay-200">🎯</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                      🎯 Secret Quest
                    </h3>
                    <p className="text-white/60 mb-8 leading-relaxed font-medium">
                      🚀 Another amazing adventure is being built just for you! 🌈
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl px-4 py-3 border-2 border-teal-400/40">
                        <span className="text-white/70 font-bold">📅 Status:</span>
                        <span className="text-teal-300 font-bold">Almost Ready!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center">
            <div className="relative bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-2xl rounded-3xl p-12 border-2 border-white/30 shadow-2xl">
              <h2 className="relative text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-12">
                🏆 Fun Stats & Numbers! 📊
              </h2>

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group">
                  <div className="bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-3xl p-8 border-2 border-green-400/50 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                    <div className="text-6xl font-black text-green-300 mb-4 animate-bounce">1</div>
                    <div className="text-white font-black text-xl mb-2">🎮 Ready Games</div>
                    <div className="text-green-200 text-lg font-bold">Let's Play!</div>
                  </div>
                </div>

                <div className="group">
                  <div className="bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-3xl p-8 border-2 border-orange-400/50 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                    <div className="text-6xl font-black text-orange-300 mb-4 animate-bounce delay-200">2</div>
                    <div className="text-white font-black text-xl mb-2">🔜 Coming Soon</div>
                    <div className="text-orange-200 text-lg font-bold">Almost Here!</div>
                  </div>
                </div>

                <div className="group">
                  <div className="bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-3xl p-8 border-2 border-purple-400/50 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                    <div className="text-6xl font-black text-purple-300 mb-4 animate-pulse">∞</div>
                    <div className="text-white font-black text-xl mb-2">✨ Fun Ideas</div>
                    <div className="text-purple-200 text-lg font-bold">Never Ending!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 bg-black/30 backdrop-blur-2xl border-t-2 border-white/20 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Main footer content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand section */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      MyInfiniteCraft
                    </h3>
                    <p className="text-white/70 font-medium">🌟 Where Fun Never Ends! ✨</p>
                  </div>
                </div>
                <p className="text-white/80 text-lg leading-relaxed max-w-md">
                  🎮 The most amazing place for kids to play, create, and discover endless fun! Join millions of young
                  creators in magical adventures! 🚀
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-xl font-black text-white mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  🔗 Quick Links
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#games"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      🎮 Games
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      ℹ️ About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#help"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      ❓ Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#news"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      📰 News
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact & Support */}
              <div>
                <h4 className="text-xl font-black text-white mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  📞 Contact Us
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="mailto:hello@myinfinitecraft.com"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      📧 hello@myinfinitecraft.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="#support"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      🛟 Support Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#feedback"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      💬 Send Feedback
                    </a>
                  </li>
                  <li>
                    <a
                      href="#parents"
                      className="text-white/70 hover:text-white font-medium transition-colors duration-300 hover:underline"
                    >
                      👨‍👩‍👧‍👦 For Parents
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Safety & Legal section */}
            <div className="border-t border-white/20 pt-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-black text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    🛡️ Safety First!
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    MyInfiniteCraft is designed to be 100% safe for kids. We don't collect personal information and all
                    content is family-friendly. Parents can play along too! 👨‍👩‍👧‍👦
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    📜 Important Links
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a
                      href="#privacy"
                      className="text-white/70 hover:text-white transition-colors duration-300 hover:underline"
                    >
                      🔒 Privacy Policy
                    </a>
                    <a
                      href="#terms"
                      className="text-white/70 hover:text-white transition-colors duration-300 hover:underline"
                    >
                      📋 Terms of Use
                    </a>
                    <a
                      href="#cookies"
                      className="text-white/70 hover:text-white transition-colors duration-300 hover:underline"
                    >
                      🍪 Cookie Policy
                    </a>
                    <a
                      href="#safety"
                      className="text-white/70 hover:text-white transition-colors duration-300 hover:underline"
                    >
                      🛡️ Safety Guidelines
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright and final info */}
            <div className="border-t border-white/20 pt-8 text-center">
              <div className="mb-6">
                <p className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  © 2025 MyInfiniteCraft - All Rights Reserved ✨
                </p>
                <p className="text-white/70 text-lg font-medium max-w-3xl mx-auto">
                  🌟 Made with lots of love for amazing kids everywhere! Keep creating, keep dreaming, keep playing! 🚀
                </p>
              </div>

              <div className="flex justify-center space-x-8 text-sm text-white/60">
                <span>🌍 Available Worldwide</span>
                <span>🎮 100% Free to Play</span>
                <span>👨‍👩‍👧‍👦 Family Friendly</span>
                <span>🛡️ Safe & Secure</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Infinite Craft 游戏视图
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* 游戏头部 */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={backToHome}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-bold shadow-lg transform hover:scale-105"
              >
                <span>←</span>
                <span>Back to MyInfiniteCraft</span>
              </button>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚡ Infinite Craft
              </h1>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-blue-700 font-bold">🔍 {gameStats.totalDiscoveries}</span>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                <span className="text-green-700 font-bold">⚡ {gameStats.combinations}</span>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
                <span className="text-purple-700 font-bold">⏰ {formatTime(gameStats.sessionTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 游戏状态消息 */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg">
            <p className="text-lg font-bold text-gray-800 text-center">{message}</p>
            {showNewDiscovery && (
              <div className="mt-2 animate-bounce text-center">
                <span className="text-4xl">{showNewDiscovery.emoji}</span>
                <span className="ml-3 text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {showNewDiscovery.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 h-full">
          {/* 工作区 */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg h-full">
              <h2 className="text-2xl font-black text-gray-800 mb-4 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🧪 Workspace
              </h2>

              <Droppable droppableId="workspace">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] border-2 border-dashed rounded-xl p-4 transition-all ${
                      snapshot.isDraggingOver
                        ? "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50"
                        : "border-gray-300 bg-gradient-to-br from-gray-50 to-white"
                    }`}
                  >
                    {workspaceElements.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="text-5xl mb-3 animate-bounce">🎯</div>
                          <p className="font-medium">Drag elements here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {workspaceElements.map((element, index) => (
                          <Draggable key={element.id} draggableId={element.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-xl p-4 shadow-md border-2 border-blue-200 text-center relative group transition-all duration-300 ${
                                  snapshot.isDragging ? "rotate-3 scale-105 shadow-2xl" : "hover:scale-105"
                                }`}
                              >
                                <button
                                  onClick={() => removeFromWorkspace(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 font-bold"
                                >
                                  ×
                                </button>
                                <div className="text-4xl mb-2">{element.emoji}</div>
                                <div className="text-sm font-bold text-gray-700">{element.name}</div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="mt-6 space-y-3">
                <button
                  onClick={combineElements}
                  disabled={workspaceElements.length !== 2}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-black py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg text-lg"
                >
                  ⚡ COMBINE ELEMENTS ✨
                </button>
                <button
                  onClick={clearWorkspace}
                  disabled={workspaceElements.length === 0}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                >
                  🗑️ Clear Workspace
                </button>
              </div>
            </div>
          </div>

          {/* 元素库 */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  🔬 Elements Library
                </h2>
                <div className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-blue-200">
                  <span className="font-bold text-blue-700">{filteredElements.length} elements</span>
                </div>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="🔍 Search elements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg font-medium"
                />
              </div>

              <Droppable droppableId="elements">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto"
                  >
                    {filteredElements.map((element, index) => (
                      <Draggable key={element.id} draggableId={element.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing border-2 relative ${
                              element.isNew
                                ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 animate-pulse"
                                : "border-gray-200 hover:border-blue-300"
                            } ${snapshot.isDragging ? "rotate-6 scale-110 z-50 shadow-2xl" : "hover:scale-105"}`}
                          >
                            {element.isNew && (
                              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                                NEW
                              </div>
                            )}
                            <div className="text-3xl mb-1 text-center">{element.emoji}</div>
                            <div className="text-xs font-bold text-gray-700 text-center truncate">{element.name}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
