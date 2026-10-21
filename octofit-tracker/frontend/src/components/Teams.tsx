import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  name: string;
  mascot?: string;
  members: string[];
};

type TeamsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: { teams: Team[] } };

export default function Teams() {
  const [result, setResult] = useState<TeamsState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResult({ status: 'loading' });
    getJson<{ teams: Team[] }>('/api/teams').then(
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
      <h2>Teams</h2>
      <p>Manage teams and members.</p>
      {result.status === 'loading' && <p role="status">Loading teams...</p>}
      {result.status === 'error' && <p role="alert">Unable to load teams: {result.message}</p>}
      {result.status === 'success' && result.data.teams.length === 0 && <p>No teams yet.</p>}
      {result.status === 'success' && result.data.teams.length > 0 && (
        <ul className="list-group">
          {result.data.teams.map((team) => (
            <li className="list-group-item" key={team.name}>
              <strong>{team.name}</strong>
              {team.mascot && <span> — {team.mascot}</span>}
              <span> ({team.members.length} members)</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
