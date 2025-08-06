'use client';

import { Combobox } from '@headlessui/react';
import { Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  hideDropdown?: boolean;
  allowTyping?: boolean;
}

export default function StringCombobox({
  label,
  value,
  options,
  onChange,
  placeholder = '',
  hideDropdown = false,
  allowTyping = false,
}: Props) {
  const [query, setQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filtered =
    query === ''
      ? options
      : options.filter((c) =>
          c.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="w-full">
      <label className="block font-medium mb-1">{label}</label>

      <Combobox as="div" value={value} onChange={onChange}>
        <div className="relative">
          <Combobox.Input
            className="w-full border px-3 py-2 rounded focus:outline-none cursor-pointer"
            displayValue={(v: string) => v}
            placeholder={placeholder}
            readOnly={!allowTyping}
            onClick={() => {
              if (!allowTyping) buttonRef.current?.click();
            }}
            onChange={(e) => {
              if (allowTyping) setQuery(e.target.value);
            }}
          />

          {!hideDropdown && (
            <Combobox.Button
              ref={buttonRef}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Combobox.Button>
          )}

          {filtered.length > 0 && (
            <Combobox.Options className="absolute mt-1 w-full bg-white border rounded shadow-lg z-10 max-h-60 overflow-auto">
              {filtered.map((c) => (
                <Combobox.Option
                  key={c}
                  value={c}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 ${
                      active ? 'bg-blue-100 text-blue-900' : ''
                    }`
                  }
                >
                  {({ selected }) => (
                    <span className="flex justify-between">
                      {c}
                      {selected && <Check size={16} className="text-blue-600" />}
                    </span>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
