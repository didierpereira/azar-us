/**
 * Motor RNG Criptográfico — COLJUEGOS Compliant
 *
 * Implementa el algoritmo "Provably Fair":
 * resultado = HMAC-SHA256(serverSeed, clientSeed:nonce)
 *
 * El jugador puede verificar cada tirada DESPUÉS de que
 * el servidor revela el serverSeed original.
 *
 * Referencia: Resolución 20161500049405 COLJUEGOS
 */

import { createHmac, randomBytes, createHash } from 'crypto';

/**
 * Genera un server seed aleatorio criptográficamente seguro.
 * Debe generarse ANTES de cada ronda y mantenerse secreto hasta revelarla.
 */
export function generateServerSeed(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Retorna el hash SHA-256 del server seed.
 * Se muestra al jugador ANTES de la ronda como compromiso (commitment scheme).
 */
export function hashServerSeed(serverSeed: string): string {
  return createHash('sha256').update(serverSeed).digest('hex');
}

/**
 * Genera un float criptográficamente seguro en [0, 1).
 *
 * Algoritmo:
 * 1. HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}`) → 64 hex chars
 * 2. Toma los primeros 8 chars (32 bits) → convierte a entero
 * 3. Normaliza a [0, 1) dividiendo por 2^32
 */
export function generateFloat(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): number {
  const hmac = createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');

  // 8 hex chars = 4 bytes = 32-bit unsigned int
  const int32 = parseInt(hmac.substring(0, 8), 16);

  // Normalizar a [0, 1) — 0x100000000 = 2^32
  return int32 / 0x100000000;
}

/**
 * Verifica si un resultado es correcto dados los seeds revelados.
 * Útil para auditoría y para que el jugador compruebe sus tiradas.
 */
export function verifyResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  expectedFloat: number,
): boolean {
  const computed = generateFloat(serverSeed, clientSeed, nonce);
  return Math.abs(computed - expectedFloat) < 1e-10;
}
