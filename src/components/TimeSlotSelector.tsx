'use client';

import { TimeSlot } from '@/lib/actions';

interface TimeSlotSelectorProps {
  selected: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  disabled?: boolean;
}

const slots: { id: TimeSlot; label: string; emoji: string; description: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅', description: '~8-11am' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️', description: '~11am-2pm' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙', description: '~6-9pm' },
  { id: 'allday', label: 'All Day', emoji: '🎉', description: 'The whole day!' },
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
              p-4 rounded-xl border-2 transition-all text-center
              ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : isDisabled
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
              }
            `}
          >
            <div className="text-2xl mb-1">{slot.emoji}</div>
            <div className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
              {slot.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{slot.description}</div>
          </button>
        );
      })}
    </div>
  );
}
