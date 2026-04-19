import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const idsToDelete = [10, 11];
  
  // We can't use deleteMany if there are relations, so we might need to delete related data first, 
  // but let's see if deleteMany works.
  
  for (const id of idsToDelete) {
     // Borrado físico de la BD
     // Primero veamos si tienen estudiante_sm_vc o algo
     const est = await prisma.estudiante.findFirst({ where: { usuario_id_sm_vc: id }});
     if (est) {
         await prisma.conversacion.deleteMany({ where: { estudiante_id_sm_vc: est.id_sm_vc }});
         await prisma.estudiante.delete({ where: { id_sm_vc: est.id_sm_vc }});
     }
  }

  const deletedData = await prisma.usuario.deleteMany({
    where: {
      id_sm_vc: { in: idsToDelete }
    }
  });

  console.log(`✅ Usuarios eliminados: ${deletedData.count}`);
}
main().finally(() => prisma.$disconnect());
