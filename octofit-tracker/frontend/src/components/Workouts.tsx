import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

type WorkoutsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: { suggestions: WorkoutSuggestion[] } };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const [result, setResult] = useState<WorkoutsState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResult({ status: 'loading' });
    getJson<{ suggestions: WorkoutSuggestion[] }>(
      `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
    ).then(
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
  }, [userEmail]);

  return (
    <section>
      <h2>Workout suggestions</h2>
      <p>Recommend workouts from activity patterns.</p>
      {result.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
      {result.status === 'error' && <p role="alert">Unable to load workout suggestions: {result.message}</p>}
      {result.status === 'success' && result.data.suggestions.length === 0 && <p>No workout suggestions yet.</p>}
      {result.status === 'success' && result.data.suggestions.length > 0 && (
        <ul className="list-group">
          {result.data.suggestions.map((suggestion) => (
            <li className="list-group-item" key={suggestion.title}>
              <strong>{suggestion.title}</strong>
              {suggestion.focus && <span> — {suggestion.focus}</span>}
              {suggestion.minutes !== undefined && <span>, {suggestion.minutes} minutes</span>}
              {suggestion.difficulty && <span>, {suggestion.difficulty}</span>}
              {suggestion.reason && <p className="mb-0">{suggestion.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
