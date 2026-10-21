import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  type: string;
  minutes: number;
  points: number;
};

type ActivityState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: { activities: Activity[] } };

export default function Activities() {
  const [result, setResult] = useState<ActivityState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResult({ status: 'loading' });
    getJson<{ activities: Activity[] }>('/api/activities').then(
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
      <h2>Activities</h2>
      <p>Track student activity minutes and points.</p>
      {result.status === 'loading' && <p role="status">Loading activities...</p>}
      {result.status === 'error' && <p role="alert">Unable to load activities: {result.message}</p>}
      {result.status === 'success' && result.data.activities.length === 0 && <p>No activities yet.</p>}
      {result.status === 'success' && result.data.activities.length > 0 && (
        <ul className="list-group">
          {result.data.activities.map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${index}`}>
              {activity.type}: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
