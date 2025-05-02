"use client";

import { useState } from "react";

type ChatMessage = {
    message: string;
    sender: "user" | "assistant";
  };

export default function Chatbot() {
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Defina o tipo do estado
    const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return; // Previne enviar mensagens vazias
    setLoading(true);

    // Envia a mensagem para a API do Chatbot
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage }),
    });

    // Processa a resposta da API
    const data = await response.json();
    setChatHistory((prev) => [
      ...prev,
      { message: userMessage, sender: "user" },
      { message: data.response, sender: "assistant" },
    ]);

    // Limpa a entrada de mensagem
    setUserMessage("");
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Exibe o histórico de conversa */}
        {chatHistory.map((chat, index) => (
          <div key={index} className={chat.sender === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block p-2 rounded-lg ${
                chat.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              {chat.message}
            </div>
          </div>
        ))}
      </div>

      {/* Campo de entrada de mensagem */}
      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        className="border p-2 w-full"
        placeholder="Digite sua mensagem"
      />

      {/* Botão para enviar a mensagem */}
      <button
        onClick={handleSendMessage}
        className="mt-2 bg-blue-600 text-white p-2 w-full"
      >
        {loading ? "Carregando..." : "Enviar"}
      </button>
    </div>
  );
}
