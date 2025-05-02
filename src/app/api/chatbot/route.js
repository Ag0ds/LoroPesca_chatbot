import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prisma = new PrismaClient();

export async function POST(req) {
  const { userMessage } = await req.json();

  try {
    // Consultar o banco de dados para obter os produtos
    const products = await prisma.products.findMany();

    // Consultar as especificações técnicas dos produtos
    const technicalSpecs = await prisma.technical_specs.findMany();

    // Criação de um contexto para a IA com base nos produtos e especificações
    let productDetails = "Quero que você responda os usuários baseado nesses produtos e suas especificações técnicas. Aqui estão os produtos da loja:\n";
    
    products.forEach((product) => {
      const spec = technicalSpecs.find((spec) =>
        product.product_name.toLowerCase().includes(spec.product_group.toLowerCase())
      );
    
      productDetails += `Produto: ${product.product_name}, Preço: R$${product.price}, Disponibilidade: ${product.availability}, Especificações: ${spec ? spec.technical_details : "Sem especificações"}\n`;
    });
    

    // Incluir a mensagem do usuário no contexto
    const prompt = `${productDetails}\nUsuário: ${userMessage}\nResponda de forma útil.`;

    // Chamada à API Gemini para gerar conteúdo com o contexto
    const responseFromGemini = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,  // Passando o contexto completo para a IA
    });

    // Retornar a resposta gerada pela IA
    return NextResponse.json({ response: responseFromGemini.text });
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    return NextResponse.json({ message: "Erro ao processar a solicitação" }, { status: 500 });
  }
}
