"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Bot, MessageSquareMore, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Como posso ajudar você hoje?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null);  // Usando useRef para o contêiner de mensagens

  // Função para rolar até o final das mensagens
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

// Enviar a mensagem para a IA do Gemini 2.0 Flash
const handleSendMessage = async () => {
  if (!message.trim()) return;

  // Adicionar a mensagem do usuário ao histórico
  const userMessage = {
    sender: "user",
    text: message,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  setChatMessages([...chatMessages, userMessage]);
  setMessage(""); // Limpa o campo de entrada

  try {
    // Enviar mensagem para a API do chatbot
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage: message }), // Passa a mensagem do usuário para a API
    });

    // Recebe a resposta da IA
    const data = await response.json();
    const botMessage = {
      sender: "bot",
      text: data.response, // Resposta da IA
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Adicionar a resposta da IA ao histórico de mensagens
    setChatMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    console.error("Erro ao comunicar com a API:", error);
    const botMessage = {
      sender: "bot",
      text: "Desculpe, houve um erro ao processar sua solicitação.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, botMessage]); // Mensagem de erro do bot
  }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    handleSendMessage();
  }
};

useEffect(() => {
  scrollToBottom();  // Rolagem automática quando a lista de mensagens for atualizada
}, [chatMessages]);

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
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                <Bot size={20} />
                <span className="sr-only">Bot</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-700 hover:text-blue-500 hover:bg-blue-50 relative"
              >
                <MessageSquareMore size={20} />
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

      {/* Mini Chat */}
      {isChatOpen && (
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
              onClick={() => setIsChatOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto max-h-80 space-y-3">
            {chatMessages.map((msg, index) => (
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
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2 text-blue-500">
            <Input
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
