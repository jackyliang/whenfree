'use client';

import { TimeSlot } from '@/lib/actions';

interface TimeSlotSelectorProps {
  selected: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  disabled?: boolean;
}

const slots: { id: TimeSlot; label: string; emoji: string; description: string; gradient: string }[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    emoji: '🌅',
    description: '8-11am',
    gradient: 'from-amber-100 to-orange-100'
  },
  {
    id: 'lunch',
    label: 'Lunch',
    emoji: '☀️',
    description: '11am-2pm',
    gradient: 'from-yellow-100 to-amber-100'
  },
  {
    id: 'dinner',
    label: 'Dinner',
    emoji: '🌙',
    description: '6-9pm',
    gradient: 'from-purple-100 to-pink-100'
  },
  {
    id: 'allday',
    label: 'All Day',
    emoji: '🎉',
    description: 'Whole day!',
    gradient: 'from-rose-100 to-orange-100'
  },
];

export default function TimeSlotSelector({
  selected,
  onChange,
  disabled = false,
}: TimeSlotSelectorProps) {
  const toggleSlot = (slot: TimeSlot) => {
    if (disabled) return;

    if (slot === 'allday') {
      if (selected.includes('allday')) {
        onChange([]);
      } else {
        onChange(['allday']);
      }
    } else {
      const newSelected = selected.filter((s) => s !== 'allday');
      if (newSelected.includes(slot)) {
        onChange(newSelected.filter((s) => s !== slot));
      } else {
        onChange([...newSelected, slot]);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {slots.map((slot) => {
        const isSelected = selected.includes(slot.id);
        const isDisabled =
          disabled || (slot.id !== 'allday' && selected.includes('allday'));

        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => toggleSlot(slot.id)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            className={`
              relative flex sm:flex-col items-center gap-3 sm:gap-1 p-3 sm:p-4 rounded-2xl text-left sm:text-center transition-all duration-150 active:scale-[0.97] border-2
              ${
                isSelected
                  ? 'bg-[var(--coral)] border-[var(--coral)] shadow-md shadow-[var(--coral)]/25'
                  : isDisabled
                  ? 'bg-[var(--cream-dark)] border-transparent opacity-40 cursor-not-allowed'
                  : `bg-gradient-to-br ${slot.gradient} border-transparent [@media(hover:hover)]:hover:shadow-md`
              }
            `}
          >
            <span className="text-2xl sm:text-3xl leading-none">{slot.emoji}</span>
            <span className="min-w-0">
              <span className={`block font-semibold text-sm ${isSelected ? 'text-white' : 'text-[var(--warm-brown)]'}`}>
                {slot.label}
              </span>
              <span className={`block text-xs ${isSelected ? 'text-white/85' : 'text-[var(--warm-gray)]'}`}>
                {slot.description}
              </span>
            </span>

            {isSelected && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-[var(--coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
