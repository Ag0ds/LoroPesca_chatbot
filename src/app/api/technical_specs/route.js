import { PrismaClient } from '@prisma/client';  // Ajuste o caminho conforme necessário

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Consultando todos os dados de technical_specs
    const technicalSpecs = await prisma.technical_specs.findMany();
    return new Response(JSON.stringify(technicalSpecs), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Erro ao buscar as especificações técnicas' }), { status: 500 });
  }
}
