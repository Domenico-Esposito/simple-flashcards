import { useState, useEffect, useCallback } from 'react';
import { useFlashcardsStore } from '@/store/flashcards';
import { StatsSeries } from '@/types';

export type Interval = 'day' | 'month' | 'quarter' | 'semester' | 'year';

export function useStatistics(deckId?: number, initialInterval: Interval = 'day') {
  const [interval, setInterval] = useState<Interval>(initialInterval);
  const [data, setData] = useState<StatsSeries[]>([]);
  const [kpis, setKpis] = useState({
    totalQuizzes: 0,
    accuracy: 0,
    totalAnswers: 0,
    totalTime: 0,
    avgTimePerQuiz: 0,
  });
  const [loading, setLoading] = useState(false);

  const { getGlobalStats, getDeckStats, getKPIs } = useFlashcardsStore();

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      let startDate: string | undefined;
      
      if (interval === 'day') {
        // Last 7 days
        const d = new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString();
      } else if (interval === 'month') {
        // Last 6 months
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        startDate = d.toISOString();
      } else {
        // For longer periods, last 2 years
        const d = new Date();
        d.setFullYear(d.getFullYear() - 2);
        startDate = d.toISOString();
      }

      const statsPromise = deckId 
        ? getDeckStats(deckId, interval, startDate)
        : getGlobalStats(interval, startDate);
        
      const kpisPromise = getKPIs(deckId);
      
      const [statsResult, kpisResult] = await Promise.all([statsPromise, kpisPromise]);
      
      setData(statsResult);
      setKpis(kpisResult);
    } catch (error) {
      console.error('Failed to load stats:', error);
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
    refresh: loadStats
  };
}
