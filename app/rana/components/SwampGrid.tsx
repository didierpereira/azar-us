'use client';

import { ROW_MULTIPLIERS, ROWS, COLS } from '@/lib/game/rana/constants';
import type { ClientSession } from '@/lib/game/rana/types';
import { LilyPad } from './LilyPad';

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SwampGridProps {
  session: ClientSession | null;
  onPick: (row: number, col: number) => void;
  isLoading: boolean;
}

export function SwampGrid({ session, onPick, isLoading }: SwampGridProps) {
  const currentRow = session?.currentRow ?? 0;
  const isPlaying = session?.status === 'playing';

  // Filas de ARRIBA (ROWS-1) hacia ABAJO (0) — la rana sube
  const displayRows = Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i);

  return (
    <div className="flex gap-2 sm:gap-3 items-stretch">
      {/* Grid de nenúfares */}
      <div className="flex flex-col gap-2 sm:gap-2.5">
        {displayRows.map((rowIndex) => {
          const isCurrentRow = isPlaying && rowIndex === currentRow;

          return (
            <div
              key={rowIndex}
              className={cn(
                'flex gap-2 sm:gap-2.5 rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 transition-all duration-300',
                isCurrentRow && 'bg-green-500/10 ring-1 ring-green-400/30',
              )}
            >
              {Array.from({ length: COLS }, (_, colIndex) => (
                <LilyPad
                  key={colIndex}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  session={session}
                  isCurrentRow={isCurrentRow}
                  onPick={(col) => onPick(rowIndex, col)}
                  isLoading={isLoading}
                />
              ))}
            </div>
          );
        })}

        {/* Posición inicial — la rana espera aquí */}
        <div className="flex justify-center py-1">
          <div
            className={cn(
              'flex items-center justify-center rounded-full transition-all duration-500',
              !session && 'ring-2 ring-yellow-400/60',
            )}
            style={{
              width: 52,
              height: 52,
              background: 'radial-gradient(circle at 35% 35%, #86efac, #16a34a)',
              border: '2.5px solid #4ade80',
              boxShadow: session ? 'none' : '0 0 20px rgba(74,222,128,0.6)',
            }}
          >
            {!session && (
              <span
                className="text-2xl"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
              >
                🐸
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Multiplicadores por fila */}
      <div className="flex flex-col gap-2 sm:gap-2.5 justify-start pt-0.5">
        {displayRows.map((rowIndex) => {
          const mult = ROW_MULTIPLIERS[rowIndex];
          const isActive =
            session?.status === 'playing' && rowIndex < (session?.currentRow ?? 0);
          const isCurrent =
            session?.status === 'playing' && rowIndex === (session?.currentRow ?? 0);

          return (
            <div
              key={rowIndex}
              className="flex items-center h-12.5 sm:h-15.5 pl-1.5 sm:pl-2"
            >
              <span
                className={cn(
                  'font-mono font-bold text-xs sm:text-sm transition-all duration-300',
                  isActive && 'text-green-400',
                  isCurrent && 'text-yellow-300 sm:text-base',
                  !isActive && !isCurrent && 'text-sky-300/60',
                )}
                style={isCurrent ? { textShadow: '0 0 12px rgba(253,224,71,0.8)' } : undefined}
              >
                ×{mult.toFixed(2)}
              </span>
            </div>
          );
        })}
        {/* Espacio del pad inicial */}
        <div className="h-15.5" />
      </div>
    </div>
  );
}
