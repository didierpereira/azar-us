'use server';

/**
 * Server Actions — Juego de la Rana (Swamp Lily Hopper)
 *
 * Modelo de sesión multi-paso Provably Fair:
 * 1. startSessionAction: genera el tablero completo en el servidor.
 *    Retorna serverSeedHash (commitment) — el cliente NO puede ver el tablero.
 * 2. pickCellAction: el jugador elige una celda en la fila actual.
 *    El servidor evalúa y revela SOLO esa fila.
 * 3. cashOutAction: el jugador cobra con el multiplicador actual.
 * 4. Al terminar (lost/cashed/won_all): se revela el serverSeed completo
 *    para que el jugador pueda verificar el tablero completo.
 */

import { randomBytes } from 'crypto';
import { generateServerSeed, hashServerSeed } from '@/lib/rng/engine';
import { generateBoard, evaluatePick } from '@/lib/game/rana/engine';
import { GAME_CONFIG, ROW_MULTIPLIERS } from '@/lib/game/rana/constants';
import type { ClientSession, RevealedRow, SessionStatus } from '@/lib/game/rana/types';

// ────────────────────────────────────────────────────────────────
// Server-side session store (MVP — reemplazar con Prisma+DB en producción)
// ────────────────────────────────────────────────────────────────

interface ServerSession {
  id: string;
  playerId: string;
  betAmount: number;
  currentRow: number;
  status: SessionStatus;
  board: boolean[][];       // NUNCA enviado al cliente mientras status === 'playing'
  revealedRows: RevealedRow[];
  currentMultiplier: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  createdAt: number;
}

// TODO: Reemplazar con: await db.session.create({ ... })
const _sessions = new Map<string, ServerSession>();
const _playerNonces = new Map<string, number>();

/** Limpia sesiones más antiguas de 24h */
function cleanupOldSessions() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, s] of _sessions) {
    if (s.createdAt < cutoff) _sessions.delete(id);
  }
}

/** Convierte la sesión servidor → vista cliente (sin el board oculto) */
function toClientView(session: ServerSession): ClientSession {
  const isEnded = session.status !== 'playing';
  return {
    id: session.id,
    betAmount: session.betAmount,
    currentRow: session.currentRow,
    totalRows: GAME_CONFIG.rows,
    status: session.status,
    revealedRows: session.revealedRows,
    currentMultiplier: session.currentMultiplier,
    potentialPayout: Math.round(session.betAmount * session.currentMultiplier),
    serverSeedHash: session.serverSeedHash,
    // Revelar seed solo cuando la partida terminó (para verificación Provably Fair)
    serverSeed: isEnded ? session.serverSeed : undefined,
    clientSeed: session.clientSeed,
    nonce: session.nonce,
  };
}

/**
 * Inicia una nueva sesión de juego.
 * Genera el tablero completo en el servidor.
 * El cliente recibe el commitment (serverSeedHash) pero NO el tablero.
 */
export async function startSessionAction(
  playerId: string,
  betAmount: number,
  clientSeed: string,
): Promise<ClientSession> {
  // Validaciones
  if (!playerId || typeof playerId !== 'string' || playerId.length > 64) {
    throw new Error('playerId inválido');
  }
  if (typeof betAmount !== 'number' || !Number.isInteger(betAmount)) {
    throw new Error('betAmount debe ser un entero');
  }
  if (betAmount < GAME_CONFIG.minBet || betAmount > GAME_CONFIG.maxBet) {
    throw new Error(
      `Apuesta fuera de rango. Mínimo $${GAME_CONFIG.minBet.toLocaleString('es-CO')}, ` +
        `máximo $${GAME_CONFIG.maxBet.toLocaleString('es-CO')} COP`,
    );
  }
  if (!clientSeed || typeof clientSeed !== 'string' || clientSeed.length > 128) {
    throw new Error('clientSeed inválido');
  }

  cleanupOldSessions();

  const serverSeed = generateServerSeed();
  const serverSeedHash = hashServerSeed(serverSeed);
  const nonce = (_playerNonces.get(playerId) ?? 0) + 1;
  _playerNonces.set(playerId, nonce);

  // Generar tablero completo — queda oculto en el servidor
  const board = generateBoard(serverSeed, clientSeed, nonce);
  const sessionId = randomBytes(16).toString('hex');

  const session: ServerSession = {
    id: sessionId,
    playerId,
    betAmount,
    currentRow: 0,
    status: 'playing',
    board,
    revealedRows: [],
    currentMultiplier: 0,
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce,
    createdAt: Date.now(),
  };

  _sessions.set(sessionId, session);
  return toClientView(session);
}

/**
 * El jugador elige una celda en la fila actual.
 * Evalúa si es segura o trampa, revela la fila completa y actualiza el estado.
 */
export async function pickCellAction(
  sessionId: string,
  col: number,
): Promise<ClientSession> {
  const session = _sessions.get(sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  if (session.status !== 'playing') throw new Error('La sesión ya terminó');

  const row = session.currentRow;

  if (!Number.isInteger(col) || col < 0 || col >= GAME_CONFIG.cols) {
    throw new Error('Columna inválida');
  }

  const boardRow = session.board[row];
  const isSafe = evaluatePick(boardRow, col);

  // Revelar la fila completa (para mostrar al jugador qué celdas eran trampa)
  const revealedRow: RevealedRow = {
    rowIndex: row,
    pickedCol: col,
    wasSafe: isSafe,
    cells: boardRow,
  };

  session.revealedRows.push(revealedRow);

  if (!isSafe) {
    session.status = 'lost';
    session.currentMultiplier = 0;
  } else {
    session.currentMultiplier = ROW_MULTIPLIERS[row];
    session.currentRow += 1;

    if (session.currentRow >= GAME_CONFIG.rows) {
      session.status = 'won_all';
    }
  }

  return toClientView(session);
}

/**
 * El jugador cobra con el multiplicador de la fila que completó.
 * Solo disponible si completó al menos una fila.
 */
export async function cashOutAction(sessionId: string): Promise<ClientSession> {
  const session = _sessions.get(sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  if (session.status !== 'playing') throw new Error('La sesión ya terminó');
  if (session.currentRow === 0) {
    throw new Error('Completá al menos una fila antes de cobrar');
  }

  session.status = 'cashed';
  return toClientView(session);
}

