import type { TimeSlot } from './actions';

export const SLOT_EMOJI: Record<TimeSlot, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  allday: '🎉',
};

export const SLOT_LABEL: Record<TimeSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  allday: 'All Day',
};

export function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
