const { PrismaClient } = require('@prisma/client');
async function test() {
  const p = new PrismaClient();
  const e = await p.entrega.findUnique({
    where: { id_sm_vc: 50 },
    include: { estudiante: true }
  });
  console.log('Entrega 50 was evaluated. Estudiante:', e.estudiante);
}
test();
