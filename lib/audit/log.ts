/**
 * Audit Log — Registro de Auditoría COLJUEGOS
 *
 * IMPORTANTE: Este es un almacenamiento en MEMORIA para el MVP.
 * En producción DEBE reemplazarse con una base de datos persistente
 * (PostgreSQL + Prisma) con índices en playerId y timestamp.
 *
 * Requisitos COLJUEGOS:
 * - Cada ronda debe quedar registrada de forma inmutable
 * - El registro debe incluir: jugador, apuesta, semillas, resultado, timestamp
 * - Retención de registros: mínimo 5 años
 * - TODO: Implementar inmutabilidad con hash chain en producción
 */

import type { AuditEntry } from '../game/rana/types';

// TODO: Reemplazar con: import { db } from '@/lib/db'
const _auditStore = new Map<string, AuditEntry>();

/**
 * Registra una ronda en el audit log.
 * Esta operación debe ser ATÓMICA con el pago al jugador.
 */
export function recordRound(entry: AuditEntry): void {
  // Validaciones de integridad
  if (!entry.id || !entry.playerId) {
    throw new Error('[AUDIT] Entrada inválida: id y playerId son requeridos');
  }
  if (_auditStore.has(entry.id)) {
    throw new Error(`[AUDIT] Entrada duplicada: ${entry.id}`);
  }
  _auditStore.set(entry.id, Object.freeze({ ...entry }));
}

/**
 * Retorna el historial de un jugador ordenado por timestamp DESC.
 * TODO: Paginar en producción
 */
export function getPlayerHistory(playerId: string, limit = 50): AuditEntry[] {
  return [..._auditStore.values()]
    .filter((e) => e.playerId === playerId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Busca una entrada específica por ID (para verificación pública).
 */
export function getEntry(id: string): AuditEntry | undefined {
  return _auditStore.get(id);
}

/**
 * Retorna métricas de sesión para el jugador (Responsabilidad Social).
 */
export function getSessionStats(playerId: string): {
  totalBet: number;
  totalPayout: number;
  rounds: number;
  netResult: number;
} {
  const entries = [..._auditStore.values()].filter((e) => e.playerId === playerId);
  const totalBet = entries.reduce((sum, e) => sum + e.betAmount, 0);
  const totalPayout = entries.reduce((sum, e) => sum + e.payout, 0);
  return {
    totalBet,
    totalPayout,
    rounds: entries.length,
    netResult: totalPayout - totalBet,
  };
}
