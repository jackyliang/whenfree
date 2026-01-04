'use server';

import sql from './db';
import { nanoid } from 'nanoid';
import { headers } from 'next/headers';
import { checkRateLimit, RATE_LIMITS } from './rateLimit';

export type TimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'allday';

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

export interface Event {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  admin_code: string;
  host_dates: string[];
  time_slots: TimeSlot[];
  created_at: Date;
}

export interface Response {
  id: number;
  event_id: string;
  name: string;
  availability: Record<string, TimeSlot[]>;
  created_at: Date;
  updated_at: Date;
}

export async function createEvent(data: {
  title: string;
  location?: string;
  description?: string;
  adminCode: string;
  hostDates: string[];
  timeSlots: TimeSlot[];
}): Promise<{ id: string }> {
  const ip = await getClientIP();
  const rateCheck = checkRateLimit(`create:${ip}`, RATE_LIMITS.createEvent);

  if (!rateCheck.success) {
    throw new Error('Too many requests. Please try again later.');
  }

  const id = nanoid(10);

  await sql`
    INSERT INTO events (id, title, location, description, admin_code, host_dates, time_slots)
    VALUES (
      ${id},
      ${data.title},
      ${data.location || null},
      ${data.description || null},
      ${data.adminCode},
      ${JSON.stringify(data.hostDates)},
      ${JSON.stringify(data.timeSlots)}
    )
  `;

  return { id };
}

// Helper to safely parse JSONB fields that might come back as strings
function parseJsonField<T>(value: unknown): T {
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }
  return value as T;
}

export async function getEvent(id: string): Promise<Event | null> {
  const result = await sql`
    SELECT * FROM events WHERE id = ${id}
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    description: row.description,
    admin_code: row.admin_code,
    host_dates: parseJsonField<string[]>(row.host_dates),
    time_slots: parseJsonField<TimeSlot[]>(row.time_slots),
    created_at: row.created_at,
  };
}

export async function verifyAdminCode(eventId: string, code: string): Promise<boolean> {
  const ip = await getClientIP();
  const rateCheck = checkRateLimit(`verify:${ip}:${eventId}`, RATE_LIMITS.verifyCode);

  if (!rateCheck.success) {
    throw new Error('Too many attempts. Please try again later.');
  }

  const result = await sql`
    SELECT admin_code FROM events WHERE id = ${eventId}
  `;

  if (result.length === 0) return false;
  return result[0].admin_code === code;
}

export async function submitResponse(data: {
  eventId: string;
  name: string;
  availability: Record<string, TimeSlot[]>;
}): Promise<void> {
  const ip = await getClientIP();
  const rateCheck = checkRateLimit(`submit:${ip}`, RATE_LIMITS.submitResponse);

  if (!rateCheck.success) {
    throw new Error('Too many requests. Please try again later.');
  }

  await sql`
    INSERT INTO responses (event_id, name, availability)
    VALUES (${data.eventId}, ${data.name}, ${JSON.stringify(data.availability)})
    ON CONFLICT (event_id, name)
    DO UPDATE SET
      availability = ${JSON.stringify(data.availability)},
      updated_at = NOW()
  `;
}

export async function getResponses(eventId: string): Promise<Response[]> {
  const result = await sql`
    SELECT * FROM responses WHERE event_id = ${eventId} ORDER BY created_at ASC
  `;

  return result.map(row => ({
    id: row.id,
    event_id: row.event_id,
    name: row.name,
    availability: parseJsonField<Record<string, TimeSlot[]>>(row.availability),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getEventWithResponses(eventId: string): Promise<{
  event: Event;
  responses: Response[];
} | null> {
  const event = await getEvent(eventId);
  if (!event) return null;

  const responses = await getResponses(eventId);
  return { event, responses };
}
