/**
 * Tipos del Juego de la Rana — Swamp Lily Hopper
 * Certificación COLJUEGOS — Juego de Suerte y Azar
 *
 * Mecánica:
 * - Grilla de COLS×ROWS nenúfares
 * - El jugador elige un nenúfar por fila (de abajo hacia arriba)
 * - FROGS_PER_ROW nenúfares ocultos son peligrosos por fila
 * - Si elige uno peligroso: pierde la apuesta
 * - Si elige uno seguro: avanza, multiplicador aumenta
 * - Puede cobrar entre filas ("Take Winnings")
 */

/** Estado visible de un nenúfar desde el cliente */
export type CellState =
  | 'hidden'          // No revelado aún
  | 'safe_picked'     // El jugador eligió este y era seguro
  | 'danger_picked'   // El jugador eligió este y había peligro
  | 'safe_revealed'   // Celda segura revelada (fila completada)
  | 'danger_revealed' // Celda peligrosa revelada (fila completada);

/** Resultado de revelar una fila completa */
export interface RevealedRow {
  rowIndex: number;
  pickedCol: number;
  wasSafe: boolean;
  /** true en cada posición que tenía peligro — revelado al completar/perder la fila */
  cells: boolean[];
}

/** Estado de la sesión desde la perspectiva del cliente */
export type SessionStatus =
  | 'playing'   // Partida en curso
  | 'lost'      // Hit a frog — lost bet
  | 'cashed'    // Player cashed out voluntarily
  | 'won_all';  // Cleared all rows — maximum prize

/**
 * Vista de sesión enviada al cliente.
 * NUNCA incluye el board completo (tablero oculto) — solo filas ya reveladas.
 */
export interface ClientSession {
  id: string;
  betAmount: number;
  /** Índice de la fila que el jugador debe jugar ahora (0 = fila inferior) */
  currentRow: number;
  totalRows: number;
  status: SessionStatus;
  revealedRows: RevealedRow[];
  /** Multiplicador acumulado si el jugador cobra ahora mismo */
  currentMultiplier: number;
  /** Pago potencial = betAmount × currentMultiplier */
  potentialPayout: number;
  /** Hash SHA-256 del server seed — mostrado ANTES de que empiece la partida */
  serverSeedHash: string;
  /** Server seed revelado SOLO cuando la partida termina (para verificación) */
  serverSeed?: string;
  clientSeed: string;
  nonce: number;
}

export interface AuditEntry {
  id: string;
  playerId: string;
  betAmount: number;
  serverSeedHash: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  status: SessionStatus;
  rowsCleared: number;
  multiplier: number;
  payout: number;
  timestamp: number;
}

export interface GameConfig {
  cols: number;
  rows: number;
  frogsPerRow: number;
  multipliers: readonly number[];
  minBet: number;
  maxBet: number;
  maxDailyLoss: number;
  startingBalance: number;
  currency: string;
  rtp: number;
  licenseNumber: string;
}
