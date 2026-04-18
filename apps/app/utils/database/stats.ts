import type { StatisticsInterval, StatisticsKpis, StatsSeries } from '@/types';

import { getDb } from './connection';

export async function getStats(
  interval: StatisticsInterval,
  deckId?: number,
  startDate?: string,
): Promise<StatsSeries[]> {
  let periodExpr = "strftime('%Y-%m-%d', s.startedAt)";

  if (interval === 'month') {
    periodExpr = "strftime('%Y-%m', s.startedAt)";
  } else if (interval === 'year') {
    periodExpr = "strftime('%Y', s.startedAt)";
  } else if (interval === 'quarter') {
    periodExpr =
      "strftime('%Y', s.startedAt) || '-Q' || ((CAST(strftime('%m', s.startedAt) AS INTEGER) - 1) / 3 + 1)";
  } else if (interval === 'semester') {
    periodExpr =
      "strftime('%Y', s.startedAt) || '-S' || ((CAST(strftime('%m', s.startedAt) AS INTEGER) - 1) / 6 + 1)";
  }

  let whereClause = 's.endedAt IS NOT NULL';
  const params: (string | number)[] = [];

  if (deckId) {
    whereClause += ' AND s.deckId = ?';
    params.push(deckId);
  }

  if (startDate) {
    whereClause += ' AND s.startedAt >= ?';
    params.push(startDate);
  }

  const query = `
    SELECT
      ${periodExpr} as period,
      SUM(s.easyCount) as easy,
      SUM(s.totalCards - s.easyCount - s.hardCount) as medium,
      SUM(s.hardCount) as hard
    FROM quiz_sessions s
    WHERE ${whereClause}
    GROUP BY period
    ORDER BY period ASC
  `;

  return await getDb().getAllAsync<StatsSeries>(query, params);
}

export async function getKPIs(deckId?: number): Promise<StatisticsKpis> {
  let whereClause = 'endedAt IS NOT NULL';
  const params: (string | number)[] = [];

  if (deckId) {
    whereClause += ' AND deckId = ?';
    params.push(deckId);
  }

  const query = `
    SELECT
      COUNT(*) as totalQuizzes,
      SUM(totalTimeSpent) as totalTime,
      SUM(totalCards) as totalCards,
      SUM(easyCount) as easyCount,
      SUM(hardCount) as hardCount,
      COUNT(DISTINCT deckId) as totalDecks
    FROM quiz_sessions
    WHERE ${whereClause}
  `;

  const result = await getDb().getFirstAsync<StatisticsKpis>(query, params);

  return {
    totalQuizzes: result?.totalQuizzes || 0,
    totalTime: result?.totalTime || 0,
    totalCards: result?.totalCards || 0,
    easyCount: result?.easyCount || 0,
    hardCount: result?.hardCount || 0,
    totalDecks: result?.totalDecks || 0,
  };
}

export async function resetAllStats(): Promise<void> {
  await getDb().runAsync('DELETE FROM quiz_answers');
  await getDb().runAsync('DELETE FROM quiz_sessions');
}
