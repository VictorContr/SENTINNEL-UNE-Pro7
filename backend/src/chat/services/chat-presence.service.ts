import { Injectable, Logger } from '@nestjs/common';

interface PresenciaSocket_sm_vc {
  socketId_sm_vc:     string;
  userId_sm_vc:       number;
  rol_sm_vc:          string;
  salas_sm_vc:        Set<string>;
  connectedAt_sm_vc:  Date;
}

/**
 * ChatPresenceService_sm_vc — Gestión en memoria de sockets conectados y salas.
 *
 * Responsabilidades:
 *   - Registrar/desregistrar conexiones de Socket.io.
 *   - Rastrear a qué salas pertenece cada socket para limpiarlas al desconectar.
 *   - Proveer estadísticas de presencia sin persistencia en BD (volátil).
 */
@Injectable()
export class ChatPresenceService_sm_vc {
  private readonly logger_sm_vc = new Logger(ChatPresenceService_sm_vc.name);

  /** Mapa socketId → presencia */
  private readonly conexiones_sm_vc = new Map<string, PresenciaSocket_sm_vc>();

  // ─── Registro de conexiones ────────────────────────────────────

  registrarConexion_sm_vc(
    socketId_sm_vc: string,
    userId_sm_vc:   number,
    rol_sm_vc:      string,
  ): void {
    this.conexiones_sm_vc.set(socketId_sm_vc, {
      socketId_sm_vc,
      userId_sm_vc,
      rol_sm_vc,
      salas_sm_vc:       new Set<string>(),
      connectedAt_sm_vc: new Date(),
    });
    this.logger_sm_vc.debug(
      `[+] Conectado: socket=${socketId_sm_vc} userId=${userId_sm_vc} rol=${rol_sm_vc}` +
      ` | Total activos: ${this.conexiones_sm_vc.size}`,
    );
  }

  registrarDesconexion_sm_vc(socketId_sm_vc: string): void {
    const presencia_sm_vc = this.conexiones_sm_vc.get(socketId_sm_vc);
    if (!presencia_sm_vc) return;

    this.logger_sm_vc.debug(
      `[-] Desconectado: socket=${socketId_sm_vc} userId=${presencia_sm_vc.userId_sm_vc}` +
      ` | Salas limpias: ${presencia_sm_vc.salas_sm_vc.size}` +
      ` | Total activos: ${this.conexiones_sm_vc.size - 1}`,
    );
    this.conexiones_sm_vc.delete(socketId_sm_vc);
  }

  // ─── Gestión de salas ──────────────────────────────────────────

  unirASala_sm_vc(socketId_sm_vc: string, roomId_sm_vc: string): void {
    const presencia_sm_vc = this.conexiones_sm_vc.get(socketId_sm_vc);
    if (presencia_sm_vc) presencia_sm_vc.salas_sm_vc.add(roomId_sm_vc);
  }

  salirDeSala_sm_vc(socketId_sm_vc: string, roomId_sm_vc: string): void {
    const presencia_sm_vc = this.conexiones_sm_vc.get(socketId_sm_vc);
    if (presencia_sm_vc) presencia_sm_vc.salas_sm_vc.delete(roomId_sm_vc);
  }

  // ─── Consultas ─────────────────────────────────────────────────

  obtenerPresencia_sm_vc(socketId_sm_vc: string): PresenciaSocket_sm_vc | undefined {
    return this.conexiones_sm_vc.get(socketId_sm_vc);
  }

  contarConectados_sm_vc(): number {
    return this.conexiones_sm_vc.size;
  }

  obtenerSalasDeSocket_sm_vc(socketId_sm_vc: string): string[] {
    return Array.from(
      this.conexiones_sm_vc.get(socketId_sm_vc)?.salas_sm_vc ?? new Set(),
    );
  }
}