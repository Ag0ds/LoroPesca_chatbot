import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const products = await prisma.products.findMany(); // Consulta todos os produtos
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Erro ao buscar produtos' }), { status: 500 });
  }
}
