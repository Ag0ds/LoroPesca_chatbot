import { PrismaClient } from '@prisma/client'; // Ajuste o caminho conforme necessário

const prisma = new PrismaClient();

export async function GET(req) {
  // Extraindo os parâmetros da URL usando URLSearchParams
  const url = new URL(req.url, 'http://localhost'); // A URL é necessária para poder usar o searchParams
  const searchQuery = url.searchParams.get('searchQuery');  // Pegando o parâmetro de busca

  // Se searchQuery não for fornecido, retorna todos os produtos
  if (!searchQuery) {
    return new Response(JSON.stringify({ message: 'Nenhuma palavra-chave fornecida.' }), { status: 400 });
  }

  try {
    // Consultando os produtos com base no parâmetro de busca (busca parcial com 'contains')
    const products = await prisma.products.findMany({
      where: {
        product_name: {
          contains: searchQuery,  // Pesquisa parcial no nome do produto
          mode: 'insensitive',    // Ignora maiúsculas/minúsculas
        },
      },
    });

    // Retorna os produtos encontrados
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Erro ao buscar produtos' }), { status: 500 });
  }
}
