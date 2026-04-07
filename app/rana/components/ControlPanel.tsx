'use client';

import { GAME_CONFIG } from '@/lib/game/rana/constants';
import type { ClientSession } from '@/lib/game/rana/types';

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const PRESETS = [500, 1_000, 2_500, 5_000, 10_000, 25_000];

export interface ControlPanelProps {
  balance: number;
  betAmount: number;
  dailyLoss: number;
  session: ClientSession | null;
  isLoading: boolean;
  onBetChange: (n: number) => void;
  onStartGame: () => void;
  onCashOut: () => void;
  onNewGame: () => void;
}

export function ControlPanel({
  balance,
  betAmount,
  dailyLoss,
  session,
  isLoading,
  onBetChange,
  onStartGame,
  onCashOut,
  onNewGame,
}: ControlPanelProps) {
  const isPlaying = session?.status === 'playing';
  const isEnded = session && session.status !== 'playing';
  const canCashOut = isPlaying && (session?.currentRow ?? 0) > 0;
  const potentialPayout = canCashOut ? session!.potentialPayout : 0;

  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #5a3a1a 0%, #3d2510 100%)',
    border: '3px solid #8b5e3c',
    boxShadow: '4px 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.15)',
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-3 sm:p-4 w-full sm:w-52"
      style={panelStyle}
    >
      {/* Balance */}
      <div
        className="rounded-xl p-2 sm:p-3 text-center"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,200,100,0.2)' }}
      >
        <p className="text-[#c9a84c] text-[10px] font-mono uppercase tracking-widest mb-0.5">
          Balance
        </p>
        <p className="text-white font-mono font-black text-base sm:text-lg">{COP(balance)}</p>
      </div>

      {/* — Apuesta (solo antes de jugar) — */}
      {!isPlaying && !isEnded && (
        <>
          <div>
            <p className="text-[#c9a84c] text-[10px] font-mono uppercase tracking-widest mb-2">
              Apuesta
            </p>
            {/* En mobile: 2 columnas; en sm+: 3 */}
            <div className="grid grid-cols-3 gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onBetChange(preset)}
                  disabled={preset > balance}
                  className={cn(
                    'rounded-lg py-1.5 text-[11px] font-mono font-bold transition-all',
                    betAmount === preset
                      ? 'text-[#3d2510]'
                      : 'text-[#c9a84c] hover:text-white opacity-80 hover:opacity-100',
                    preset > balance && 'opacity-30 cursor-not-allowed',
                  )}
                  style={{
                    background:
                      betAmount === preset ? '#c9a84c' : 'rgba(201,168,76,0.15)',
                    border: `1px solid ${
                      betAmount === preset ? '#f0d070' : 'rgba(201,168,76,0.3)'
                    }`,
                  }}
                >
                  {preset >= 1_000 ? `${preset / 1_000}K` : preset}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-2 text-center"
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <span className="text-[#c9a84c] font-mono font-black">{COP(betAmount)}</span>
          </div>

          {dailyLoss > 0 && (
            <p className="text-[9px] font-mono text-amber-400/70 text-center">
              Pérdida hoy: {COP(dailyLoss)} / {COP(GAME_CONFIG.maxDailyLoss)}
            </p>
          )}
        </>
      )}

      {/* — Payout potencial (jugando) — */}
      {isPlaying && canCashOut && (
        <div
          className="rounded-xl p-2 sm:p-3 text-center"
          style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.4)',
          }}
        >
          <p className="text-[#4ade80] text-[10px] font-mono uppercase tracking-widest mb-1">
            Si cobras ahora
          </p>
          <p className="text-[#4ade80] font-mono font-black text-xl">
            {COP(potentialPayout)}
          </p>
          <p className="text-[#4ade80]/60 text-[10px] font-mono">
            ×{session!.currentMultiplier.toFixed(2)}
          </p>
        </div>
      )}

      {/* — Resultado final — */}
      {isEnded && (
        <div
          className="rounded-xl p-2 sm:p-3 text-center"
          style={{
            background:
              session!.status === 'lost'
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(74,222,128,0.1)',
            border: `1px solid ${
              session!.status === 'lost'
                ? 'rgba(239,68,68,0.4)'
                : 'rgba(74,222,128,0.4)'
            }`,
          }}
        >
          {session!.status === 'lost' ? (
            <>
              <p className="text-red-400 text-[10px] font-mono uppercase mb-1">Perdiste</p>
              <p className="text-red-400 font-mono font-black text-xl">{COP(0)}</p>
            </>
          ) : (
            <>
              <p className="text-green-400 text-[10px] font-mono uppercase mb-1">
                {session!.status === 'won_all' ? '🏆 ¡RÉCORD!' : '✅ Cobrado'}
              </p>
              <p className="text-green-400 font-mono font-black text-xl">
                {COP(session!.potentialPayout)}
              </p>
              <p className="text-green-400/60 text-[10px] font-mono">
                ×{session!.currentMultiplier.toFixed(2)}
              </p>
            </>
          )}
        </div>
      )}

      {/* — Botones de acción — */}
      {!isPlaying && !isEnded && (
        <ActionButton
          onClick={onStartGame}
          disabled={
            isLoading ||
            betAmount > balance ||
            dailyLoss >= GAME_CONFIG.maxDailyLoss
          }
        >
          {isLoading ? '...' : 'Apostar'}
        </ActionButton>
      )}

      {canCashOut && (
        <ActionButton onClick={onCashOut} disabled={isLoading}>
          💰 Cobrar
        </ActionButton>
      )}

      {isEnded && (
        <ActionButton onClick={onNewGame} disabled={false}>
          Nueva Partida
        </ActionButton>
      )}

      {/* Provably Fair hash */}
      {session && (
        <div
          className="rounded-lg p-2"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(74,222,128,0.2)',
          }}
        >
          <p className="text-green-400/60 text-[9px] font-mono text-center">🔒 Provably Fair</p>
          <p className="text-green-400/40 text-[8px] font-mono text-center truncate mt-0.5">
            {session.serverSeedHash.substring(0, 16)}…
          </p>
        </div>
      )}
    </div>
  );
}

// ── Botón reutilizable ──
function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl py-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 text-white"
      style={{
        background: 'linear-gradient(180deg, #f97316, #ea580c)',
        border: '2px solid #fb923c',
        boxShadow: '0 4px 12px rgba(249,115,22,0.5)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
