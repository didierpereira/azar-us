'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { startSessionAction, pickCellAction, cashOutAction } from '../actions';
import { GAME_CONFIG } from '@/lib/game/rana/constants';
import type { ClientSession } from '@/lib/game/rana/types';

function generateClientSeed(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SwampGameState {
  session: ClientSession | null;
  balance: number;
  betAmount: number;
  isLoading: boolean;
  error: string | null;
  dailyLoss: number;
}

export interface SwampGameActions {
  setBetAmount: (n: number) => void;
  handleStartGame: () => Promise<void>;
  handlePickCell: (row: number, col: number) => Promise<void>;
  handleCashOut: () => Promise<void>;
  handleNewGame: () => void;
}

export function useSwampGame(): SwampGameState & SwampGameActions {
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);

  // Lazy-init del audio solo en el cliente (evita errores en SSR)
  useEffect(() => {
    loseAudioRef.current = new Audio('/sounds/lose-tone.mp3');
    loseAudioRef.current.preload = 'auto';
  }, []);

  const [session, setSession] = useState<ClientSession | null>(null);
  const [balance, setBalance] = useState(GAME_CONFIG.startingBalance);
  const [betAmount, setBetAmount] = useState(GAME_CONFIG.minBet);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyLoss, setDailyLoss] = useState(0);

  const [clientSeed] = useState(generateClientSeed);
  const [playerId] = useState(() =>
    typeof crypto !== 'undefined'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );

  // Hidratación desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('swamp-balance');
    const savedLoss = localStorage.getItem(
      `swamp-daily-loss-${new Date().toDateString()}`,
    );
    if (saved) setBalance(Math.max(0, parseInt(saved)));
    if (savedLoss) setDailyLoss(parseInt(savedLoss));
  }, []);

  useEffect(() => {
    localStorage.setItem('swamp-balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    if (dailyLoss > 0) {
      localStorage.setItem(
        `swamp-daily-loss-${new Date().toDateString()}`,
        dailyLoss.toString(),
      );
    }
  }, [dailyLoss]);

  const handleStartGame = useCallback(async () => {
    if (isLoading || betAmount > balance || dailyLoss >= GAME_CONFIG.maxDailyLoss) return;
    setError(null);
    setIsLoading(true);
    try {
      const newSession = await startSessionAction(playerId, betAmount, clientSeed);
      setBalance((b) => b - betAmount);
      setDailyLoss((d) => d + betAmount);
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar la partida');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, betAmount, balance, dailyLoss, playerId, clientSeed]);

  const handlePickCell = useCallback(
    async (row: number, col: number) => {
      if (!session || session.status !== 'playing' || isLoading) return;
      if (session.revealedRows.some((r) => r.rowIndex === row)) return;
      setError(null);
      setIsLoading(true);
      try {
        const updated = await pickCellAction(session.id, col);
        setSession(updated);
        if (updated.status === 'lost') {
          loseAudioRef.current?.play().catch(() => { /* autoplay bloqueado */ });
        }
        if (updated.status === 'won_all') {
          setBalance((b) => b + updated.potentialPayout);
          setDailyLoss((d) => Math.max(0, d - updated.potentialPayout));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al elegir celda');
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading],
  );

  const handleCashOut = useCallback(async () => {
    if (!session || session.status !== 'playing' || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const result = await cashOutAction(session.id);
      setSession(result);
      setBalance((b) => b + result.potentialPayout);
      setDailyLoss((d) => Math.max(0, d - result.potentialPayout));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cobrar');
    } finally {
      setIsLoading(false);
    }
  }, [session, isLoading]);

  const handleNewGame = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    // state
    session,
    balance,
    betAmount,
    isLoading,
    error,
    dailyLoss,
    // actions
    setBetAmount,
    handleStartGame,
    handlePickCell,
    handleCashOut,
    handleNewGame,
  };
}
