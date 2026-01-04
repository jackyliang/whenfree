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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            className={`
              relative p-4 rounded-2xl transition-all duration-200 text-center overflow-hidden group
              ${
                isSelected
                  ? 'bg-[var(--coral)] shadow-lg shadow-[var(--coral)]/25 scale-[1.02]'
                  : isDisabled
                  ? 'bg-[var(--cream-dark)] opacity-40 cursor-not-allowed'
                  : `bg-gradient-to-br ${slot.gradient} hover:scale-[1.02] hover:shadow-md`
              }
            `}
          >
            {/* Animated background on hover */}
            {!isSelected && !isDisabled && (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--coral)]/0 to-[var(--coral)]/0 group-hover:from-[var(--coral)]/5 group-hover:to-[var(--coral)]/10 transition-all duration-300" />
            )}

            {/* Content */}
            <div className="relative z-10">
              <div className={`text-3xl mb-2 transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                {slot.emoji}
              </div>
              <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-[var(--warm-brown)]'}`}>
                {slot.label}
              </div>
              <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-[var(--warm-gray)]'}`}>
                {slot.description}
              </div>
            </div>

            {/* Check mark for selected */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-[var(--coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
