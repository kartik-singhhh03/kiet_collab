import { Request, Response } from 'express';
import Team from '../models/Team.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/teams */
export const listTeams = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.eventId) filter.eventId = req.query.eventId;
  if (req.query.open === 'true') filter.isOpen = true;

  const teams = await Team.find(filter)
    .populate('leader', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();

  sendSuccess(res, { data: teams });
});

/** GET /api/teams/:id */
export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.id)
    .populate('leader', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();
  if (!team) return sendError(res, 'Team not found', 404);
  sendSuccess(res, { data: team });
});

/** POST /api/teams */
export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { name, eventId, description } = req.body ?? {};
  if (!name) return sendError(res, 'name is required');

  const team = await Team.create({
    name,
    eventId: eventId ?? null,
    leader: req.user!._id,
    members: [req.user!._id],
    description: description ?? '',
    isOpen: true,
  });
  sendSuccess(res, { data: team }, 201);
});

/** PATCH /api/teams/:id  (leader only) */
export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 'Team not found', 404);
  if (String(team.leader) !== String(req.user!._id)) {
    return sendError(res, 'Forbidden', 403);
  }

  const allowed = ['name', 'description', 'isOpen'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (team as any)[key] = req.body[key];
  }
  await team.save();
  sendSuccess(res, { data: team });
});

/** POST /api/teams/:id/join */
export const joinTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 'Team not found', 404);
  if (!team.isOpen) return sendError(res, 'Team is not open for joining');

  const uid = req.user!._id as any;
  if (team.members.some((m) => String(m) === String(uid))) {
    return sendError(res, 'Already a member');
  }
  team.members.push(uid);
  await team.save();
  sendSuccess(res, { data: team });
});

/** DELETE /api/teams/:id/leave */
export const leaveTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 'Team not found', 404);

  const uid = String(req.user!._id);
  if (String(team.leader) === uid) {
    return sendError(res, 'Leader cannot leave — transfer leadership or delete the team');
  }
  team.members = team.members.filter((m) => String(m) !== uid) as any;
  await team.save();
  sendSuccess(res, { message: 'Left team' });
});
