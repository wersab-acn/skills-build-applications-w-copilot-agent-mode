import { useApiResource } from '../hooks/useApiResource.js';

type Team = {
  name: string;
  mascot?: string;
  members: string[];
};

export default function Teams() {
  const result = useApiResource<{ teams: Team[] }>('/api/teams');
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
