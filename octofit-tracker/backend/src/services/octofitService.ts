import { Activity, Team, User, Workout } from '../models/index.js';
import { Types } from 'mongoose';

type CreateActivityInput = {
  userId: string;
  teamId: string;
  type: string;
  minutes: number;
};

function isCreateActivityInput(input: unknown): input is CreateActivityInput {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return false;
  const body = input as Record<string, unknown>;
  return typeof body.userId === 'string'
    && typeof body.teamId === 'string'
    && typeof body.type === 'string'
    && body.type.trim().length > 0
    && typeof body.minutes === 'number'
    && Number.isFinite(body.minutes)
    && body.minutes > 0;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isCreateActivityInput(input)) {
    throw Object.assign(new Error('Activity requires userId, teamId, type, and positive minutes'), { status: 400 });
  }
  if (!/^[a-f\d]{24}$/i.test(input.userId) || !/^[a-f\d]{24}$/i.test(input.teamId)) {
    throw Object.assign(new Error('Activity userId and teamId must be valid IDs'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(input.userId),
    Team.findById(input.teamId),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: input.type.trim(),
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

type CreateTeamInput = {
  name: string;
  mascot: string;
  members?: string[];
};

function isCreateTeamInput(input: unknown): input is CreateTeamInput {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return false;
  const body = input as Record<string, unknown>;
  return typeof body.name === 'string'
    && body.name.trim().length > 0
    && typeof body.mascot === 'string'
    && body.mascot.trim().length > 0
    && (body.members === undefined
      || (Array.isArray(body.members)
        && body.members.every((member) => typeof member === 'string' && /^[a-f\d]{24}$/i.test(member))));
}

export async function createTeam(input: unknown) {
  if (!isCreateTeamInput(input)) {
    throw Object.assign(new Error('Team requires a name, mascot, and valid member IDs'), { status: 400 });
  }

  return Team.create({
    name: input.name,
    mascot: input.mascot,
    members: input.members ?? [],
  });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('_id name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('fitnessGoal').lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).select('type').lean(),
    Workout.find().lean(),
  ]);
  const recentTypes = activities.map(({ type }) => type.toLowerCase());
  const fitnessGoal = user.fitnessGoal.toLowerCase();

  return workouts
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const matchesGoal = focus === fitnessGoal;
      const matchingActivity = recentTypes.find((type) => type === focus);
      const reason = matchesGoal
        ? `Recommended for your ${user.fitnessGoal} fitness goal.`
        : matchingActivity
          ? `Recommended based on your recent ${matchingActivity} activity.`
          : `Supports your ${user.fitnessGoal} fitness goal.`;
      return {
        ...workout,
        reason,
        relevance: matchesGoal ? 2 : matchingActivity ? 1 : 0,
      };
    })
    .sort((left, right) => right.relevance - left.relevance || left.title.localeCompare(right.title))
    .map(({ relevance: _relevance, ...workout }) => workout);
}

export { User };
