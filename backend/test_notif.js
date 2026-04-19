const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

const SECRET = "SENTINNEL-UNE-SUPER-SECRET-KEY-2026-VICTOR-SANTIAGO-PASSWORD-CHANGE-IN-PRODUCTION";

const studentToken = jwt.sign({ sub: 4, rol_sm_vc: 'ESTUDIANTE' }, SECRET);
const professorToken = jwt.sign({ sub: 2, rol_sm_vc: 'PROFESOR' }, SECRET);

const studentSocket = io('http://localhost:3000/chat_sm_vc', {
  auth: { token: studentToken }
});

const professorSocket = io('http://localhost:3000/chat_sm_vc', {
  auth: { token: professorToken }
});

studentSocket.on('connect', () => console.log('✅ [Student] connected'));
professorSocket.on('connect', () => console.log('✅ [Professor] connected'));

studentSocket.on('notificacion_recibida_sm_vc', (d) => console.log('📬 [Student] NOTIF_RECIBIDA:', d));
professorSocket.on('notificacion_recibida_sm_vc', (d) => console.log('📬 [Professor] NOTIF_RECIBIDA:', d));

async function run() {
  const prisma = new PrismaClient();
  const ultimaEntrega = await prisma.entrega.findFirst({
    orderBy: { id_sm_vc: 'desc' },
    where: { estado_sm_vc: { not: 'APROBADO' } }
  });
  
  if (!ultimaEntrega) {
      console.log('❌ No hay entrega'); 
      return; 
  }

  console.log(`🚀 Evaluando entrega ID: ${ultimaEntrega.id_sm_vc}`);
  try {
    const res = await fetch('http://localhost:3000/api/evaluaciones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${professorToken}`
        },
        body: JSON.stringify({
            entrega_id_sm_vc: ultimaEntrega.id_sm_vc,
            decision_sm_vc: 'APROBADO',
            observaciones_sm_vc: 'Test API directly'
        })
    });
    
    console.log('HTTP RESP:', res.status, await res.text());
  } catch (e) {
      console.error(e);
  }
}

setTimeout(run, 1500);
