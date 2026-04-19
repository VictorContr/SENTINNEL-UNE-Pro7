import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.usuario.findMany({ select: { id_sm_vc: true, nombre_sm_vc: true, apellido_sm_vc: true } });
  console.log(users);
}
main().finally(() => prisma.$disconnect());
