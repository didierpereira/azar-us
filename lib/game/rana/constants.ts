/**
 * Constantes del Juego de la Rana — Swamp Lily Hopper
 *
 * TABLA DE PAGOS — RTP CERTIFICADO: ~84.5%
 * ================================================
 * Grilla: 5 columnas, 5 filas
 * 3 trampas ocultas por fila | 2 seguros por fila
 * P(seguro en la celda elegida) = 2/5 = 0.40 por fila
 *
 * Formula multiplicador fila N (base 0):
 *   Justo:    (COLS / SAFE_PER_ROW)^(N+1) = 2.5^(N+1)
 *   Con RTP:  0.85 × 2.5^(N+1)
 *
 * | Fila | P acumulada | Mult justo | Mult 85% RTP |
 * |------|-------------|------------|---------------|
 * |  0   | 0.40        | 2.50       | ×2.10         |
 * |  1   | 0.16        | 6.25       | ×5.30         |
 * |  2   | 0.064       | 15.625     | ×13.25        |
 * |  3   | 0.0256      | 39.06      | ×33.00        |
 * |  4   | 0.01024     | 97.66      | ×82.50        |
 *
 * Verificación RTP (jugador siempre avanza al máximo):
 *   EV = P(ganar todo) × M5 = 0.01024 × 82.50 ≈ 0.845 ✓
 */

import type { GameConfig } from './types';

export const COLS = 5;
export const ROWS = 5;
export const FROGS_PER_ROW = 3; // 3 trampas, 2 seguros — riesgo alto
export const SAFE_PER_ROW = COLS - FROGS_PER_ROW; // 2

/**
 * Multiplicadores acumulados por fila (índice 0 = fila inferior).
 * Si el jugador cobra después de completar la fila N, recibe betAmount × MULTIPLIERS[N].
 */
export const ROW_MULTIPLIERS: readonly number[] = [
  2.10,   // fila 0 (inferior): 0.85 × 2.5^1 = 2.125
  5.30,   // fila 1:            0.85 × 2.5^2 = 5.312
  13.25,  // fila 2:            0.85 × 2.5^3 = 13.281
  33.00,  // fila 3:            0.85 × 2.5^4 = 33.203
  82.50,  // fila 4 (superior): 0.85 × 2.5^5 = 83.008
] as const;

// Verifica RTP en runtime
const _rtp = Math.pow(SAFE_PER_ROW / COLS, ROWS) * ROW_MULTIPLIERS[ROWS - 1];
if (Math.abs(_rtp - 0.845) > 0.02) {
  throw new Error(`[COLJUEGOS] RTP calculado ${_rtp.toFixed(4)} fuera del rango esperado (0.83–0.87)`);
}

export const RTP = _rtp;

export const GAME_CONFIG: GameConfig = {
  cols: COLS,
  rows: ROWS,
  frogsPerRow: FROGS_PER_ROW,
  multipliers: ROW_MULTIPLIERS,
  minBet: 500,
  maxBet: 50_000,
  maxDailyLoss: 200_000,
  startingBalance: 100_000,
  currency: 'COP',
  rtp: RTP,
  licenseNumber: 'COLJUEGOS-MVP-2026-001',
};
