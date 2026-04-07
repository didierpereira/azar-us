'use client';

import { GAME_CONFIG } from '@/lib/game/rana/constants';
import { useSwampGame } from './hooks/useSwampGame';
import { SwampGrid } from './components/SwampGrid';
import { ControlPanel } from './components/ControlPanel';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export default function SwampGame() {
  const {
    session,
    balance,
    betAmount,
    isLoading,
    error,
    dailyLoss,
    setBetAmount,
    handleStartGame,
    handlePickCell,
    handleCashOut,
    handleNewGame,
  } = useSwampGame();

  return (
    <div
      className="min-h-svh flex flex-col relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #87ceeb 0%, #3a9fd1 25%, #1a7dc4 60%, #0d5a9e 100%)',
      }}
    >
      {/* Ondas decorativas */}
      <WaterOverlay />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3">
        <Brand licenseNumber={GAME_CONFIG.licenseNumber} />
        <BalanceBadge balance={balance} />
      </header>

      {/* Main
        Mobile  : columna — grid arriba, controles abajo
        Desktop : fila   — controles izq, grid der
      */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full max-w-xl sm:max-w-none sm:w-auto">
          {/* Panel de control — en mobile va ABAJO (order-2) */}
          <div className="order-2 sm:order-1 w-full sm:w-auto">
            <ControlPanel
              balance={balance}
              betAmount={betAmount}
              dailyLoss={dailyLoss}
              session={session}
              isLoading={isLoading}
              onBetChange={setBetAmount}
              onStartGame={handleStartGame}
              onCashOut={handleCashOut}
              onNewGame={handleNewGame}
            />
          </div>

          {/* Grilla — en mobile va ARRIBA (order-1) */}
          <div
            className="order-1 sm:order-2 rounded-2xl p-3 sm:p-4"
            style={{
              background: 'rgba(10, 50, 90, 0.4)',
              border: '2px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <SwampGrid
              session={session}
              onPick={handlePickCell}
              isLoading={isLoading}
            />
          </div>
        </div>

        {error && <ErrorToast message={error} />}
        {session?.status === 'won_all' && <WinOverlay payout={session.potentialPayout} />}
      </main>

      {/* Footer COLJUEGOS */}
      <footer
        className="relative z-10 py-2 sm:py-3 px-3 sm:px-4 text-center"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
      >
        <p className="text-white/40 text-[9px] sm:text-[10px] font-mono leading-relaxed">
          🎰 Juego regulado por{' '}
          <strong className="text-white/60">COLJUEGOS</strong> · RTP ~
          {(GAME_CONFIG.rtp * 100).toFixed(1)}% · MODO DEMO — sin dinero real ·
          ⚠️ Jugá con responsabilidad · +18
        </p>
      </footer>
    </div>
  );
}

// ── Componentes de presentación puros ────────────────────────────

function WaterOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 200% 40% at 50% 70%, rgba(255,255,255,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 150% 30% at 30% 50%, rgba(255,255,255,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 100% 20% at 70% 30%, rgba(255,255,255,0.03) 0%, transparent 50%)
        `,
      }}
    />
  );
}

function Brand({ licenseNumber }: { licenseNumber: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2"
      style={{
        background: 'linear-gradient(135deg, #5a3a1a, #3d2510)',
        border: '2px solid #8b5e3c',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <span className="text-xl sm:text-2xl">🐸</span>
      <div>
        <p
          className="text-[#f0d070] font-black text-sm sm:text-base leading-none"
          style={{ fontFamily: 'serif' }}
        >
          SWAMP LAND
        </p>
        <p className="text-[#c9a84c]/60 text-[8px] font-mono">{licenseNumber}</p>
      </div>
    </div>
  );
}

function BalanceBadge({ balance }: { balance: number }) {
  return (
    <div
      className="rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-right"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <p className="text-white/50 text-[9px] font-mono uppercase tracking-widest">Balance</p>
      <p className="text-white font-mono font-black text-base sm:text-lg">{COP(balance)}</p>
    </div>
  );
}

function ErrorToast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2 text-sm font-mono text-white z-50 max-w-[90vw] text-center"
      style={{
        background: 'rgba(127,29,29,0.95)',
        border: '1px solid rgba(239,68,68,0.5)',
      }}
    >
      ⚠️ {message}
    </div>
  );
}

function WinOverlay({ payout }: { payout: number }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div
        className="rounded-3xl p-6 sm:p-8 text-center animate-bounce mx-4"
        style={{
          background: 'rgba(20,83,45,0.95)',
          border: '3px solid #4ade80',
          boxShadow: '0 0 60px rgba(74,222,128,0.5)',
        }}
      >
        <p className="text-5xl sm:text-6xl mb-2">🏆</p>
        <p className="text-green-400 font-black text-xl sm:text-2xl">¡RÉCORD TOTAL!</p>
        <p className="text-white font-mono text-lg sm:text-xl mt-1">{COP(payout)}</p>
        <p className="text-green-400/60 text-sm font-mono mt-1">×82.50</p>
      </div>
    </div>
  );
}
