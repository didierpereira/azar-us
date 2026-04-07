/**
 * Motor del Juego de la Rana — Swamp Lily Hopper
 *
 * Generación Provably Fair del tablero:
 * Para cada fila, se generan COLS floats con HMAC-SHA256.
 * Las FROGS_PER_ROW celdas con los floats más BAJOS son las trampas.
 * Esto garantiza que el tablero es determinístico y verificable.
 */

import { generateFloat } from '../../rng/engine';
import { COLS, ROWS, FROGS_PER_ROW } from './constants';

/**
 * Genera el tablero completo para una sesión.
 * board[rowIndex][colIndex] = true si esa celda es trampa (danger).
 *
 * El tablero se mantiene oculto en el servidor.
 * Solo se revela fila por fila conforme el jugador avanza.
 */
export function generateBoard(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): boolean[][] {
  return Array.from({ length: ROWS }, (_, row) =>
    generateBoardRow(serverSeed, clientSeed, nonce, row),
  );
}

/**
 * Genera una fila del tablero.
 * Las FROGS_PER_ROW posiciones con menor float → trampa.
 */
export function generateBoardRow(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  row: number,
): boolean[] {
  const cellFloats = Array.from({ length: COLS }, (_, col) => ({
    col,
    float: generateFloat(serverSeed, `${clientSeed}:${nonce}`, row * COLS + col),
  }));

  // Ordenar ascendente — los floats más bajos son las trampas
  cellFloats.sort((a, b) => a.float - b.float);

  const trapCols = new Set(cellFloats.slice(0, FROGS_PER_ROW).map((c) => c.col));

  return Array.from({ length: COLS }, (_, col) => trapCols.has(col));
}

/**
 * Evalúa si una celda elegida es segura.
 * @returns true si es SEGURA, false si es TRAMPA
 */
export function evaluatePick(boardRow: boolean[], col: number): boolean {
  return !boardRow[col]; // true = safe (no danger)
}

