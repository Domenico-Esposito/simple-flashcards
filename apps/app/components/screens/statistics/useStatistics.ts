import { useState, useEffect, useCallback } from 'react';
import { useStatisticsActions } from '@/store/flashcards.selectors';
import type { StatisticsInterval, StatisticsKpis, StatsSeries } from '@/types';

function getStartDateForInterval(interval: StatisticsInterval): string {
  const date = new Date();

  switch (interval) {
    case 'day':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 6);
      break;
    default:
      date.setFullYear(date.getFullYear() - 2);
      break;
  }

  return date.toISOString();
}

export function useStatistics(deckId?: number, initialInterval: StatisticsInterval = 'day') {
  const [interval, setInterval] = useState<StatisticsInterval>(initialInterval);
  const [data, setData] = useState<StatsSeries[]>([]);
  const [kpis, setKpis] = useState<StatisticsKpis>({
    totalQuizzes: 0,
    totalCards: 0,
    easyCount: 0,
    hardCount: 0,
    totalTime: 0,
    totalDecks: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getGlobalStats, getDeckStats, getKPIs } = useStatisticsActions();

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = getStartDateForInterval(interval);

      // Run sequentially to avoid NullPointerException on Android
      // when multiple prepareAsync calls happen concurrently
      const statsResult = deckId
        ? await getDeckStats(deckId, interval, startDate)
        : await getGlobalStats(interval, startDate);

      const kpisResult = await getKPIs(deckId);

      setData(statsResult);
      setKpis(kpisResult);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while loading stats.',
      );
    } finally {
      setLoading(false);
    }
  }, [interval, deckId, getGlobalStats, getDeckStats, getKPIs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    interval,
    setInterval,
    data,
    kpis,
    loading,
    error,
    refresh: loadStats,
  };
}
