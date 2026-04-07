'use client';

import type { ClientSession } from '@/lib/game/rana/types';

interface LilyPadProps {
  rowIndex: number;
  colIndex: number;
  session: ClientSession | null;
  isCurrentRow: boolean;
  onPick: (col: number) => void;
  isLoading: boolean;
}

export function LilyPad({
  rowIndex,
  colIndex,
  session,
  isCurrentRow,
  onPick,
  isLoading,
}: LilyPadProps) {
  const revealed = session?.revealedRows.find((r) => r.rowIndex === rowIndex);
  const isSelected = revealed?.pickedCol === colIndex;
  const isDanger = revealed?.cells[colIndex] === true;
  const isRevealed = revealed !== undefined;

  let bg = 'radial-gradient(circle at 35% 35%, #5cb82e, #2d7a10)';
  let border = '#4a9a20';
  let shadow = 'inset 0 -3px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.3)';
  let content: React.ReactNode = null;
  let cursor = 'default';
  let transform = 'scale(1)';

  if (isCurrentRow && !isLoading && !isRevealed) {
    cursor = 'pointer';
    shadow =
      'inset 0 -3px 8px rgba(0,0,0,0.3), 0 4px 20px rgba(100,220,60,0.5), 0 0 0 2px rgba(150,255,100,0.4)';
  }

  if (isRevealed) {
    // emoji responsive via CSS — sin JS condicional (SSR-safe)
    const emojiCls = 'text-lg sm:text-2xl';
    if (isSelected && !isDanger) {
      bg = 'radial-gradient(circle at 35% 35%, #86efac, #16a34a)';
      border = '#4ade80';
      shadow =
        '0 0 24px rgba(74,222,128,0.9), 0 0 48px rgba(74,222,128,0.4), inset 0 -3px 8px rgba(0,0,0,0.2)';
      content = (
        <span
          className={`${emojiCls} select-none`}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
        >
          🐸
        </span>
      );
      transform = 'scale(1.12)';
    } else if (isSelected && isDanger) {
      bg = 'radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)';
      border = '#ef4444';
      shadow = '0 0 24px rgba(239,68,68,0.8), 0 0 48px rgba(239,68,68,0.4)';
      content = <span className={`${emojiCls} select-none animate-bounce`}>💀</span>;
      transform = 'scale(1.1)';
    } else if (isDanger) {
      bg = 'radial-gradient(circle at 35% 35%, #dc2626, #450a0a)';
      border = '#dc2626';
      shadow = '0 0 10px rgba(220,38,38,0.4)';
      content = <span className="text-lg select-none opacity-80">🐊</span>;
    } else {
      bg = 'radial-gradient(circle at 35% 35%, #4ade80, #166534)';
      border = '#4ade80';
      shadow = '0 0 8px rgba(74,222,128,0.3)';
      content = (
        <span className="text-sm font-bold text-white select-none opacity-70">✓</span>
      );
    }
  }

  return (
    <button
      onClick={() => isCurrentRow && !isLoading && !isRevealed && onPick(colIndex)}
      disabled={!isCurrentRow || isLoading || isRevealed}
      className="relative flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 w-12 h-12 sm:w-15 sm:h-15"
      style={{
        borderRadius: '50%',
        background: bg,
        border: `2.5px solid ${border}`,
        boxShadow: shadow,
        cursor,
        transform,
      }}
      aria-label={`Celda fila ${rowIndex + 1} columna ${colIndex + 1}`}
    >
      {!isRevealed && (
        <svg
          viewBox="0 0 44 44"
          className="absolute inset-0 m-auto w-8 h-8 sm:w-11 sm:h-11 opacity-20 pointer-events-none"
        >
          <line x1="22" y1="4" x2="22" y2="22" stroke="white" strokeWidth="1.5" />
          <line x1="22" y1="22" x2="38" y2="14" stroke="white" strokeWidth="1" />
          <line x1="22" y1="22" x2="38" y2="30" stroke="white" strokeWidth="1" />
          <line x1="22" y1="22" x2="6" y2="14" stroke="white" strokeWidth="1" />
          <line x1="22" y1="22" x2="6" y2="30" stroke="white" strokeWidth="1" />
          <line x1="22" y1="22" x2="22" y2="40" stroke="white" strokeWidth="1" />
        </svg>
      )}
      {content}
    </button>
  );
}
