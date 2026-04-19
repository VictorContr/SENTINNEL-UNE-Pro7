const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { EventEmitter2 } = require('@nestjs/event-emitter');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventEmitter = app.get(EventEmitter2);
  
  eventEmitter.emit('notificacion.enviar', {
    receptorId: 4,
    notificacion: { titulo_sm_vc: "TEST", contenido_sm_vc: "TEST", tipo_sm_vc: "INFORMATIVA" }
  });
  console.log('Event emitted.');
  
  setTimeout(() => app.close(), 2000);
}
bootstrap();
