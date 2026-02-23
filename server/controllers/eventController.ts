import { Request, Response } from 'express';
import Event from '../models/Event.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/events */
export const listEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await Event.find()
    .populate('organizer', 'name email avatar')
    .sort({ startDate: 1 })
    .lean();
  sendSuccess(res, { data: events });
});

/** GET /api/events/:id */
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email avatar')
    .populate('registrations', 'name email avatar')
    .lean();
  if (!event) return sendError(res, 'Event not found', 404);
  sendSuccess(res, { data: event });
});

/** POST /api/events  (admin / faculty) */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, startDate, endDate, venue, isOnline, maxTeamSize, minTeamSize } =
    req.body ?? {};
  if (!title || !startDate || !endDate) {
    return sendError(res, 'title, startDate, and endDate are required');
  }
  const banner = (req as any).file?.path ?? '';

  const event = await Event.create({
    title,
    description,
    banner,
    startDate,
    endDate,
    venue,
    isOnline: isOnline === true || isOnline === 'true',
    maxTeamSize: maxTeamSize ?? 4,
    minTeamSize: minTeamSize ?? 1,
    organizer: req.user!._id,
  });

  sendSuccess(res, { data: event }, 201);
});

/** PATCH /api/events/:id  (admin / organizer) */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);

  const isOrganizer = String(event.organizer) === String(req.user!._id);
  if (!isOrganizer && req.user!.role !== 'admin') return sendError(res, 'Forbidden', 403);

  const allowed = ['title', 'description', 'startDate', 'endDate', 'venue', 'isOnline', 'maxTeamSize', 'minTeamSize', 'status'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (event as any)[key] = req.body[key];
  }
  await event.save();
  sendSuccess(res, { data: event });
});

/** POST /api/events/:id/register */
export const registerForEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  if (event.status !== 'upcoming') return sendError(res, 'Event is not open for registration');

  const uid = req.user!._id as any;
  const alreadyRegistered = event.registrations.some((id) => String(id) === String(uid));
  if (alreadyRegistered) return sendError(res, 'Already registered');

  event.registrations.push(uid);
  await event.save();
  sendSuccess(res, { message: 'Registered for event', registrations: event.registrations.length });
});

/** DELETE /api/events/:id  (admin only) */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  sendSuccess(res, { message: 'Event deleted' });
});
