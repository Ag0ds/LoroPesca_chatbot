"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Bot, MessageSquareMore, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBotChatOpen, setIsBotChatOpen] = useState(false)
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false)
  const [botMessage, setBotMessage] = useState("")
  const [liveMessage, setLiveMessage] = useState("")
  const [botChatMessages, setBotChatMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Como posso ajudar você hoje?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [liveChatMessages, setLiveChatMessages] = useState([])
  const [isLiveChatLoading, setIsLiveChatLoading] = useState(true)

  const botMessagesEndRef = useRef<HTMLDivElement>(null)
  const liveMessagesEndRef = useRef<HTMLDivElement>(null)

  // Função para rolar até o final das mensagens do bot
  const scrollBotToBottom = () => {
    if (botMessagesEndRef.current) {
      botMessagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Função para rolar até o final das mensagens do chat ao vivo
  const scrollLiveToBottom = () => {
    if (liveMessagesEndRef.current) {
      liveMessagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Carrega mensagens antigas do Supabase
  useEffect(() => {
    if (isLiveChatOpen) {
      const fetchMessages = async () => {
        setIsLiveChatLoading(true)
        try {
          const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true })

          if (error) throw error

          // Formatar as mensagens para o formato usado pelo chat
          const formattedMessages = data.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))

          setLiveChatMessages(formattedMessages)
        } catch (error) {
          console.error("Erro ao carregar mensagens:", error)
          // Usar dados de fallback em caso de erro
          setLiveChatMessages([
            {
              id: 1,
              sender: "atendente",
              text: "Olá! Bem-vindo ao atendimento ao cliente. Como posso ajudar?",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ])
        } finally {
          setIsLiveChatLoading(false)
        }
      }

      fetchMessages()

      // Escuta mensagens novas
      const subscription = supabase
        .channel("chat-room")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
          const newMsg = {
            id: payload.new.id,
            sender: payload.new.sender,
            text: payload.new.content,
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
          setLiveChatMessages((prev) => [...prev, newMsg])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [isLiveChatOpen])

  // Enviar a mensagem para a IA do Gemini 2.0 Flash
  const handleSendBotMessage = async () => {
    if (!botMessage.trim()) return

    // Adicionar a mensagem do usuário ao histórico
    const userMessage = {
      sender: "user",
      text: botMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setBotChatMessages([...botChatMessages, userMessage])
    const currentBotMessage = botMessage
    setBotMessage("") // Limpa o campo de entrada

    try {
      // Enviar mensagem para a API do chatbot
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: currentBotMessage }), // Passa a mensagem do usuário para a API
      })

      // Recebe a resposta da IA
      const data = await response.json()
      const botMessage = {
        sender: "bot",
        text: data.response, // Resposta da IA
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      // Adicionar a resposta da IA ao histórico de mensagens
      setBotChatMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Erro ao comunicar com a API:", error)
      const botMessage = {
        sender: "bot",
        text: "Desculpe, houve um erro ao processar sua solicitação.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setBotChatMessages((prev) => [...prev, botMessage]) // Mensagem de erro do bot
    }
  }

  // Função para enviar mensagem do chat ao vivo
  const handleSendLiveMessage = async () => {
    if (!liveMessage.trim()) return

    try {
      // Enviar mensagem para o Supabase
      await supabase.from("messages").insert({
        content: liveMessage,
        sender: "cliente", // ou 'atendente' dependendo de quem está usando
      })

      setLiveMessage("")
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)

      // Fallback em caso de erro - mostrar a mensagem localmente
      const userMessage = {
        id: Date.now(),
        sender: "cliente",
        text: liveMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setLiveChatMessages((prev) => [...prev, userMessage])
      setLiveMessage("")
    }
  }

  // Funções para lidar com tecla Enter
  const handleBotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendBotMessage()
    }
  }

  const handleLiveKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendLiveMessage()
    }
  }

  // Função para alternar entre os chats
  const toggleChat = (chatType: "bot" | "live") => {
    if (chatType === "bot") {
      setIsBotChatOpen(!isBotChatOpen)
      setIsLiveChatOpen(false)
    } else {
      setIsLiveChatOpen(!isLiveChatOpen)
      setIsBotChatOpen(false)
    }
  }

  // Rolagem automática quando as mensagens são atualizadas
  useEffect(() => {
    if (isBotChatOpen) {
      scrollBotToBottom()
    }
  }, [botChatMessages, isBotChatOpen])

  useEffect(() => {
    if (isLiveChatOpen) {
      scrollLiveToBottom()
    }
  }, [liveChatMessages, isLiveChatOpen])

  return (
    <>
      <header className="w-full bg-white border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo no canto esquerdo */}
            <Link href="/" className="flex items-center">
              <div className="relative flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg overflow-hidden">
                <span className="text-white font-bold text-xl tracking-tighter">LP</span>
                <div className="absolute inset-0 border-2 border-blue-400 rounded-lg opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-300 rounded-full opacity-70"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-blue-300 rounded-full opacity-70"></div>
              </div>
              <span className="ml-2 text-blue-800 font-semibold text-lg hidden sm:inline-block"></span>
            </Link>

            {/* Links de navegação no meio (visíveis em desktop) */}
            <nav className="hidden md:flex items-center justify-center space-x-8 flex-1">
              <Link href="/" className="text-blue-700 hover:text-blue-500 font-medium transition-colors relative group">
                Produtos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </Link>
              <Link
                href="/Detalhes"
                className="text-blue-700 hover:text-blue-500 font-medium transition-colors relative group"
              >
                Detalhes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Botões com ícones no canto direito */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-700 hover:text-blue-500 hover:bg-blue-50"
                onClick={() => toggleChat("bot")}
              >
                <Bot size={20} />
                <span className="sr-only">Bot</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-700 hover:text-blue-500 hover:bg-blue-50 relative"
                onClick={() => toggleChat("live")}
              >
                <MessageSquareMore size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {liveChatMessages.filter((m) => m.sender === "atendente" && !m.read).length || ""}
                </span>
                <span className="sr-only">Bate papo</span>
              </Button>

              {/* Botão de menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-blue-700 hover:text-blue-500 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                <span className="sr-only">Menu</span>
              </Button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t border-blue-100 mt-3">
              <Link
                href="/"
                className="block text-blue-700 hover:text-blue-500 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link
                href="/Detalhes"
                className="block text-blue-700 hover:text-blue-500 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Detalhes
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Mini Chat Bot */}
      {isBotChatOpen && (
        <div className="fixed bottom-4 right-4 w-80 sm:w-96 bg-white rounded-lg shadow-lg z-50 flex flex-col border border-blue-100 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <h3 className="font-medium">Assistente Virtual</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-blue-500 p-0"
              onClick={() => setIsBotChatOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto max-h-80 space-y-3">
            {botChatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                      : "bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg"
                  } p-3 relative`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-200 text-blue-700 text-xs">BOT</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-blue-700">Assistente</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-xs ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"} block mt-1`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={botMessagesEndRef} /> {/* Elemento para rolagem automática */}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2 text-blue-500">
            <Input
              placeholder="Digite sua mensagem..."
              value={botMessage}
              onChange={(e) => setBotMessage(e.target.value)}
              onKeyDown={handleBotKeyDown}
              className="flex-1"
            />
            <Button
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSendBotMessage}
              disabled={!botMessage.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Mini Chat Live */}
      {isLiveChatOpen && (
        <div className="fixed bottom-4 right-4 w-80 sm:w-96 bg-white rounded-lg shadow-lg z-50 flex flex-col border border-blue-100 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquareMore size={18} />
              <h3 className="font-medium">Atendimento ao Cliente</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-green-500 p-0"
              onClick={() => setIsLiveChatOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto max-h-80 space-y-3">
            {isLiveChatLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="ml-2 text-sm text-gray-500">Carregando mensagens...</span>
              </div>
            ) : liveChatMessages.length > 0 ? (
              liveChatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "cliente" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] ${
                      msg.sender === "cliente"
                        ? "bg-green-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                        : "bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg"
                    } p-3 relative`}
                  >
                    {msg.sender === "atendente" && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-green-200 text-green-700 text-xs">SUP</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-green-700">Atendente</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <span
                      className={`text-xs ${msg.sender === "cliente" ? "text-green-100" : "text-gray-500"} block mt-1`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
              </div>
            )}
            <div ref={liveMessagesEndRef} /> {/* Elemento para rolagem automática */}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={liveMessage}
              onChange={(e) => setLiveMessage(e.target.value)}
              onKeyDown={handleLiveKeyDown}
              className="flex-1 text-green-500"
            />
            <Button
              size="icon"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSendLiveMessage}
              disabled={!liveMessage.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
