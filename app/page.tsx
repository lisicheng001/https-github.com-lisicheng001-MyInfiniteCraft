"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.log("[v0] Runtime error caught:", error.message)
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

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
  useEffect(() => {
    console.log("[v0] MyInfiniteCraft component mounted successfully")
  }, [])

  const [currentView, setCurrentView] = useState<"home" | "infinite-craft">("home")
  const [showGameModal, setShowGameModal] = useState(false)

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
    timerRef.current = setInterval(() => {
      setGameStats((prev) => ({
        ...prev,
        sessionTime: prev.sessionTime + 1,
      }))
    }, 1000)
  }

  const backToHome = () => {
    setCurrentView("home")
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setWorkspaceElements([])
    setMessage("Drag elements to the workspace to combine them!")
    setSearchTerm("")
    setShowNewDiscovery(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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

  return (
    <ErrorBoundary>
      {currentView === "home" ? (
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 to-cyan-400 relative overflow-hidden">
          {/* Super cute background animations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Rainbow bubbles */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-pink-300/60 to-red-300/60 rounded-full blur-sm animate-bounce"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-yellow-300/60 to-orange-300/60 rounded-full blur-sm animate-bounce delay-300"></div>
            <div className="absolute bottom-20 left-32 w-24 h-24 bg-gradient-to-br from-green-300/60 to-emerald-300/60 rounded-full blur-sm animate-bounce delay-700"></div>
            <div className="absolute bottom-40 right-16 w-18 h-18 bg-gradient-to-br from-blue-300/60 to-cyan-300/60 rounded-full blur-sm animate-bounce delay-1000"></div>

            {/* Twinkling stars */}
            <div className="absolute top-20 left-1/4 text-yellow-300 text-2xl animate-ping">⭐</div>
            <div className="absolute top-1/3 right-1/4 text-pink-300 text-3xl animate-ping delay-500">✨</div>
            <div className="absolute bottom-1/3 left-1/3 text-purple-300 text-2xl animate-ping delay-1000">🌟</div>
            <div className="absolute bottom-20 right-1/3 text-cyan-300 text-3xl animate-ping delay-1500">💫</div>

            {/* Floating hearts */}
            <div className="absolute top-40 left-20 text-red-300 text-xl animate-pulse">💖</div>
            <div className="absolute top-60 right-40 text-pink-300 text-2xl animate-pulse delay-700">💕</div>
            <div className="absolute bottom-60 left-40 text-purple-300 text-xl animate-pulse delay-1200">💜</div>

            {/* Rainbow halos */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-400/30 via-purple-400/30 via-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-spin-slow"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-yellow-400/30 via-orange-400/30 via-red-400/30 to-pink-400/30 rounded-full blur-3xl animate-spin-slow delay-1000"></div>
          </div>

          {/* Super cute grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          <header className="relative z-10 bg-white/20 backdrop-blur-2xl border-b-4 border-white/30 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <div className="inline-flex items-center space-x-8 mb-8">
                  {/* Super cute Logo */}
                  <div className="relative group">
                    <div className="relative w-28 h-28 bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 animate-pulse">
                      <div className="text-6xl animate-bounce">🎮</div>

                      {/* Surrounding little stars */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                        <span className="text-xs">⭐</span>
                      </div>
                      <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center animate-spin delay-500">
                        <span className="text-xs">💖</span>
                      </div>
                      <div className="absolute top-0 left-0 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center animate-spin delay-1000">
                        <span className="text-xs">✨</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center animate-spin delay-1500">
                        <span className="text-xs">🌟</span>
                      </div>

                      {/* Rainbow halo */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/40 via-purple-400/40 via-blue-400/40 to-cyan-400/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent animate-pulse">
                      MyInfiniteCraft
                    </h1>
                    <div className="text-2xl text-white font-black mt-4 animate-bounce">
                      🌈 The Ultimate Gaming World! ✨
                    </div>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl text-white font-black max-w-4xl mx-auto leading-relaxed animate-pulse">
                  🎉 Welcome to the most amazing and adorable gaming paradise! 🎮
                  <br />
                  <span className="text-yellow-200 text-3xl">
                    🚀 Click the game icon to start your super adventure! 🌟
                  </span>
                </p>
              </div>
            </div>
          </header>

          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <section className="mb-20">
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-8 animate-bounce">
                  🎮 Super Fun Games! 🌟
                </h2>
                <p className="text-3xl text-white font-black max-w-3xl mx-auto animate-pulse">
                  🚀 Come discover the magical world of creation, infinite fun awaits you! ✨
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {/* Infinite Craft game card */}
                <div
                  className="group relative cursor-pointer transform transition-all duration-700 hover:scale-125 hover:rotate-3 animate-pulse"
                  onClick={handleInfiniteCraftClick}
                >
                  {/* Super cool outer halo */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-pink-400/50 via-purple-400/50 via-blue-400/50 to-cyan-400/50 rounded-3xl blur-3xl opacity-100 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                  {/* Main card */}
                  <div className="relative bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl rounded-3xl p-10 border-4 border-white/50 shadow-2xl overflow-hidden">
                    {/* Status label */}
                    <div className="absolute top-6 right-6 z-10">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-full text-lg font-black shadow-lg flex items-center space-x-3 animate-bounce">
                        <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
                        <span>🎯 Ready to Play!</span>
                      </div>
                    </div>

                    {/* Game icon */}
                    <div className="relative text-center mb-10">
                      <div className="relative inline-block">
                        <div className="relative w-36 h-36 bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 animate-pulse">
                          <div className="text-8xl animate-bounce">⚡</div>

                          {/* Surrounding particles */}
                          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200"></div>
                          <div className="absolute top-0 left-0 w-7 h-7 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-400"></div>
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-600"></div>
                          <div className="absolute top-1/2 left-0 w-4 h-4 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-800"></div>
                          <div className="absolute top-1/2 right-0 w-6 h-6 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-1000"></div>
                        </div>
                      </div>
                    </div>

                    {/* Game information */}
                    <div className="relative z-10 text-center">
                      <h3 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-6 animate-bounce">
                        ⚡ Infinite Craft ✨
                      </h3>
                      <p className="text-gray-700 mb-10 leading-relaxed text-xl font-black">
                        🧪 Mix different elements together to create super cool new things! From simple water and fire
                        to magical creatures and awesome inventions! 🌟
                      </p>

                      <div className="space-y-4 text-lg mb-10">
                        <div className="flex justify-between items-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl px-6 py-4 border-4 border-pink-300/60">
                          <span className="text-gray-800 font-black">🎨 Type:</span>
                          <span className="text-pink-600 font-black">Creative Fun!</span>
                        </div>
                        <div className="flex justify-between items-center bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl px-6 py-4 border-4 border-blue-300/60">
                          <span className="text-gray-800 font-black">👥 Players:</span>
                          <span className="text-cyan-600 font-black">Just You!</span>
                        </div>
                        <div className="flex justify-between items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl px-6 py-4 border-4 border-green-300/60">
                          <span className="text-gray-800 font-black">⭐ Difficulty:</span>
                          <span className="text-green-600 font-black">Super Easy!</span>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white font-black py-6 px-10 rounded-3xl transition-all duration-300 transform group-hover:scale-110 shadow-2xl text-2xl animate-pulse">
                        <span className="flex items-center justify-center space-x-4">
                          <span>🚀 Start Playing Now! 🎮</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Game 1 */}
                <div className="group relative transform transition-all duration-500 hover:scale-110 hover:rotate-2 opacity-80">
                  <div className="relative bg-gradient-to-br from-white/80 to-white/70 backdrop-blur-xl rounded-3xl p-10 border-4 border-white/40 shadow-xl">
                    <div className="absolute top-6 right-6">
                      <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-3 rounded-full text-lg font-black shadow-lg flex items-center space-x-3 animate-bounce">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <span>🔜 Coming Soon!</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="relative inline-block mb-10">
                        <div className="w-32 h-32 bg-gradient-to-br from-orange-300/60 to-red-300/60 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                          <span className="text-7xl animate-bounce">🎲</span>
                        </div>
                      </div>

                      <h3 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
                        🎲 Mystery Adventure
                      </h3>
                      <p className="text-gray-600 mb-10 leading-relaxed text-xl font-black">
                        🌟 A super cool new game is on the way! Get ready for more fun! ✨
                      </p>

                      <div className="space-y-4 text-lg">
                        <div className="flex justify-between items-center bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl px-6 py-4 border-4 border-orange-300/60">
                          <span className="text-gray-700 font-black">📅 Status:</span>
                          <span className="text-orange-600 font-black">Almost Ready!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Game 2 */}
                <div className="group relative transform transition-all duration-500 hover:scale-110 hover:rotate-2 opacity-80">
                  <div className="relative bg-gradient-to-br from-white/80 to-white/70 backdrop-blur-xl rounded-3xl p-10 border-4 border-white/40 shadow-xl">
                    <div className="absolute top-6 right-6">
                      <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-3 rounded-full text-lg font-black shadow-lg flex items-center space-x-3 animate-bounce">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <span>🔜 Coming Soon!</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="relative inline-block mb-10">
                        <div className="w-32 h-32 bg-gradient-to-br from-teal-300/60 to-cyan-300/60 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                          <span className="text-7xl animate-bounce delay-200">🎯</span>
                        </div>
                      </div>

                      <h3 className="text-3xl font-black bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
                        🎯 Secret Mission
                      </h3>
                      <p className="text-gray-600 mb-10 leading-relaxed text-xl font-black">
                        🚀 Another awesome adventure is being prepared for you! 🌈
                      </p>

                      <div className="space-y-4 text-lg">
                        <div className="flex justify-between items-center bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl px-6 py-4 border-4 border-teal-300/60">
                          <span className="text-gray-700 font-black">📅 Status:</span>
                          <span className="text-teal-600 font-black">Almost Ready!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics section */}
            <div className="text-center">
              <div className="relative bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-2xl rounded-3xl p-16 border-4 border-white/50 shadow-2xl">
                <h2 className="relative text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-16 animate-bounce">
                  🏆 Awesome Statistics! 📊
                </h2>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="group">
                    <div className="bg-gradient-to-br from-green-300/60 to-emerald-300/60 rounded-3xl p-10 border-4 border-green-400/70 group-hover:scale-125 transition-all duration-700 shadow-2xl">
                      <div className="text-8xl font-black text-green-600 mb-6 animate-bounce">1</div>
                      <div className="text-white font-black text-2xl mb-4 bg-green-500 rounded-2xl py-2">
                        🎮 Ready Games
                      </div>
                      <div className="text-green-700 text-xl font-black">Come and play!</div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="bg-gradient-to-br from-orange-300/60 to-red-300/60 rounded-3xl p-10 border-4 border-orange-400/70 group-hover:scale-125 transition-all duration-700 shadow-2xl">
                      <div className="text-8xl font-black text-orange-600 mb-6 animate-bounce delay-200">2</div>
                      <div className="text-white font-black text-2xl mb-4 bg-orange-500 rounded-2xl py-2">
                        🔜 Coming Soon
                      </div>
                      <div className="text-orange-700 text-xl font-black">Almost here!</div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="bg-gradient-to-br from-purple-300/60 to-pink-300/60 rounded-3xl p-10 border-4 border-purple-400/70 group-hover:scale-125 transition-all duration-700 shadow-2xl">
                      <div className="text-8xl font-black text-purple-600 mb-6 animate-pulse">∞</div>
                      <div className="text-white font-black text-2xl mb-4 bg-purple-500 rounded-2xl py-2">
                        ✨ Fun Ideas
                      </div>
                      <div className="text-purple-700 text-xl font-black">Never ending!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-20">
              <div className="relative bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-2xl rounded-3xl p-16 border-4 border-white/50 shadow-2xl">
                <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-16 text-center animate-bounce">
                  💬 Player Reviews! 🌟
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Comment 1 */}
                  <div className="group bg-gradient-to-br from-pink-100/80 to-purple-100/80 rounded-3xl p-8 border-4 border-pink-300/60 shadow-xl hover:scale-105 transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-2xl animate-bounce">
                        😊
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-800">小明</h4>
                        <div className="flex text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed">
                      "这就是原版！太好玩了，我已经创造了好多新元素！🎉"
                    </p>
                    <div className="mt-4 text-sm text-gray-500 font-medium">2 hours ago</div>
                  </div>

                  {/* Comment 2 */}
                  <div className="group bg-gradient-to-br from-blue-100/80 to-cyan-100/80 rounded-3xl p-8 border-4 border-blue-300/60 shadow-xl hover:scale-105 transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl animate-bounce delay-200">
                        🤩
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-800">Emma</h4>
                        <div className="flex text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed">
                      "Amazing! This is exactly like the original version! My kids love it! 🌈✨"
                    </p>
                    <div className="mt-4 text-sm text-gray-500 font-medium">5 hours ago</div>
                  </div>

                  {/* Comment 3 */}
                  <div className="group bg-gradient-to-br from-green-100/80 to-emerald-100/80 rounded-3xl p-8 border-4 border-green-300/60 shadow-xl hover:scale-105 transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-2xl animate-bounce delay-500">
                        🥳
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-800">Alex</h4>
                        <div className="flex text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed">
                      "Perfect recreation! This is the original experience we all remember! 🎮🔥"
                    </p>
                    <div className="mt-4 text-sm text-gray-500 font-medium">1 day ago</div>
                  </div>

                  {/* Comment 4 */}
                  <div className="group bg-gradient-to-br from-yellow-100/80 to-orange-100/80 rounded-3xl p-8 border-4 border-yellow-300/60 shadow-xl hover:scale-105 transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl animate-bounce delay-700">
                        😍
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-800">小红</h4>
                        <div className="flex text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed">
                      "哇！这就是原版的感觉！界面超级可爱，孩子们玩得停不下来！💖"
                    </p>
                    <div className="mt-4 text-sm text-gray-500 font-medium">2 days ago</div>
                  </div>

                  {/* Comment 5 */}
                  <div className="group bg-gradient-to-br from-purple-100/80 to-pink-100/80 rounded-3xl p-8 border-4 border-purple-300/60 shadow-xl hover:scale-105 transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl animate-bounce delay-1000">
                        🤗
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-800">Sarah</h4>
                        <div className="flex text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed">
                      "This is the original! So nostalgic and fun! The animations are adorable! 🌟"
                    </p>
                    <div className="mt-4 text-sm text-gray-500 font-medium">3 days ago</div>
                  </div>

                  {/* Comment 6 */}
                  <div className="group bg-gradient-to-br from-teal-100/80 to-cyan-100/80 rounded-3xl p-8 border-4 border-teal-300/60 shadow-xl hover:scale-105 transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl animate-bounce delay-1200">
                        🎉
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-800">David</h4>
                        <div className="flex text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed">
                      "Exactly what I was looking for! This is the original version with all the magic! ⚡🎮"
                    </p>
                    <div className="mt-4 text-sm text-gray-500 font-medium">1 week ago</div>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <button className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white font-black py-4 px-8 rounded-3xl transition-all duration-300 transform hover:scale-110 shadow-2xl text-xl animate-pulse">
                    💬 Leave Your Review! ✨
                  </button>
                </div>
              </div>
            </section>
          </main>

          {/* Super cute footer */}
          <footer className="relative z-10 bg-white/30 backdrop-blur-2xl border-t-4 border-white/40 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              {/* Main footer content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
                {/* Brand area */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
                      <span className="text-4xl animate-bounce">🎮</span>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        MyInfiniteCraft
                      </h3>
                      <p className="text-white font-black text-xl">🌟 The fun never ends! ✨</p>
                    </div>
                  </div>
                  <p className="text-white text-xl leading-relaxed max-w-md font-black">
                    🎮 This is the best gaming paradise for kids! Join little creators from around the world and start
                    your magical adventure! 🚀
                  </p>
                </div>

                {/* Quick links */}
                <div>
                  <h4 className="text-2xl font-black text-white mb-8 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                    🔗 Quick Links
                  </h4>
                  <ul className="space-y-4">
                    <li>
                      <a
                        href="#games"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        🎮 Games
                      </a>
                    </li>
                    <li>
                      <a
                        href="#about"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        ℹ️ About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#help"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        ❓ Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="#news"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        📰 News
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact us */}
                <div>
                  <h4 className="text-2xl font-black text-white mb-8 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                    📞 Contact Us
                  </h4>
                  <ul className="space-y-4">
                    <li>
                      <a
                        href="mailto:hello@myinfinitecraft.com"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        📧 hello@myinfinitecraft.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="#support"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        🛟 Support Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="#feedback"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        💬 Send Feedback
                      </a>
                    </li>
                    <li>
                      <a
                        href="#parents"
                        className="text-white/90 hover:text-white font-black text-lg transition-colors duration-300 hover:underline"
                      >
                        👨‍👩‍👧‍👦 For Parents
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Safety and legal information */}
              <div className="border-t-4 border-white/40 pt-12 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-2xl font-black text-white mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      🛡️ Safety First!
                    </h4>
                    <p className="text-white/90 text-lg leading-relaxed font-black">
                      MyInfiniteCraft is designed specifically for kids, 100% safe! We don't collect personal
                      information, all content is suitable for the whole family to play together! Parents can join too!
                      👨‍👩‍👧‍👦
                    </p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white mb-6 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                      📜 Important Links
                    </h4>
                    <div className="flex flex-wrap gap-6 text-lg">
                      <a
                        href="#privacy"
                        className="text-white/90 hover:text-white font-black transition-colors duration-300 hover:underline"
                      >
                        🔒 Privacy Policy
                      </a>
                      <a
                        href="#terms"
                        className="text-white/90 hover:text-white font-black transition-colors duration-300 hover:underline"
                      >
                        📋 Terms of Service
                      </a>
                      <a
                        href="#cookies"
                        className="text-white/90 hover:text-white font-black transition-colors duration-300 hover:underline"
                      >
                        🍪 Cookie Policy
                      </a>
                      <a
                        href="#safety"
                        className="text-white/90 hover:text-white font-black transition-colors duration-300 hover:underline"
                      >
                        🛡️ Safety Guidelines
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright and final information */}
              <div className="border-t-4 border-white/40 pt-12 text-center">
                <div className="mb-8">
                  <p className="text-3xl font-black bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-4 animate-pulse">
                    © 2025 MyInfiniteCraft - All Rights Reserved ✨
                  </p>
                  <p className="text-white text-2xl font-black max-w-4xl mx-auto animate-bounce">
                    🌟 Made with love for amazing kids around the world! Keep creating, keep dreaming, keep playing! 🚀
                  </p>
                </div>

                <div className="flex justify-center space-x-12 text-lg text-white/80 font-black">
                  <span>🌍 Play Worldwide</span>
                  <span>🎮 100% Free</span>
                  <span>👨‍👩‍👧‍👦 Family Friendly</span>
                  <span>🛡️ Safe & Secure</span>
                </div>
              </div>
            </div>
          </footer>

          {/* Game launch modal */}
          {showGameModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full border-4 border-white/50 shadow-2xl animate-bounce">
                <div className="text-center">
                  <div className="text-8xl mb-8 animate-spin">⚡</div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-6">
                    🚀 Ready to Start Adventure!
                  </h3>
                  <p className="text-gray-700 mb-10 text-xl font-black leading-relaxed">
                    Are you sure you want to start playing Infinite Craft? Ready to create super cool things? ✨
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={startInfiniteCraft}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg text-xl"
                    >
                      🎮 Start Playing!
                    </button>
                    <button
                      onClick={() => setShowGameModal(false)}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg text-xl"
                    >
                      🔙 Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* Game header */}
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

            {/* Game status message */}
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
              {/* Workspace */}
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

              {/* Elements library */}
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
                                <div className="text-xs font-bold text-gray-700 text-center truncate">
                                  {element.name}
                                </div>
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
      )}
    </ErrorBoundary>
  )
}
