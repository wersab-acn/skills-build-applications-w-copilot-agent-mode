import { useApiResource } from '../hooks/useApiResource.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const result = useApiResource<{ suggestions: WorkoutSuggestion[] }>(
    `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
  );
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
