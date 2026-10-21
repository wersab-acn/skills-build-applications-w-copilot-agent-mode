import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type LeaderboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: { leaderboard: LeaderboardEntry[] } };

export default function Leaderboard() {
  const [result, setResult] = useState<LeaderboardState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResult({ status: 'loading' });
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then(
      (data) => {
        if (active) setResult({ status: 'success', data });
      },
      (error: unknown) => {
        if (active) {
          setResult({
            status: 'error',
            message: error instanceof Error ? error.message : 'An unexpected error occurred.',
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <h2>Leaderboard</h2>
      <p>Compare team point totals.</p>
      {result.status === 'loading' && <p role="status">Loading leaderboard...</p>}
      {result.status === 'error' && <p role="alert">Unable to load leaderboard: {result.message}</p>}
      {result.status === 'success' && result.data.leaderboard.length === 0 && <p>No leaderboard rankings yet.</p>}
      {result.status === 'success' && result.data.leaderboard.length > 0 && (
        <ol className="list-group list-group-numbered">
          {result.data.leaderboard.map((entry) => (
            <li className="list-group-item" key={entry.teamName}>
              {entry.teamName}: {entry.totalPoints} points (rank {entry.rank})
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
