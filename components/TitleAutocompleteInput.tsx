'use client';

import { useState, useEffect, useRef } from 'react';

type Props = {
  category: string; 
  onSelect: (title: string, meta?: { id: number; image: string }) => void;
  initialValue?: string;
};

export const CONSOLES = [
  'PlayStation', 'PlayStation 2', 'PlayStation 3', 'PlayStation 4', 'PlayStation 5',
  'Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series S', 'Xbox Series X',
  'Wii', 'Wii U', 'Nintendo Switch', 'Game Boy', 'Game Boy Advance', 'Super Ninetndo', 'GameCube', 'Nintendo 64',
  'Nintendo DS', 'Nintendo DSi', 'Nintendo 3DS', 'PlayStation Portable (PSP)', 'PlayStation Vita (PS Vita)', 'PlayStation Portal', 'PC', 
];

export const ITEM_TYPES = [
  'Game', 'Console', 'PC', 'Controller', 'Accessory', 'Merchandise', 'Other',
];

export default function TitleAutocompleteInput({ category, onSelect, initialValue }: Props) {
  const [input, setInput] = useState(initialValue || '');
  const [suggestions, setSuggestions] = useState<{ name: string, id?: number, image?: string }[]>([]);
  const [locked, setLocked] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValue && !locked) {
      setInput(initialValue);
    }
  }, [initialValue, category]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!input || locked || !hasFocused) {
      setSuggestions([]); // Clear suggestions if conditions are not met
      return;
    }

    const fetchSuggestions = async () => {
      console.log('Fetching suggestions for:', { input, category });
      
      if (category === 'Console') {
        const filtered = CONSOLES.filter(c => c.toLowerCase().includes(input.toLowerCase()));
        setSuggestions(filtered.map(name => ({ name })));
        return;
      }

      try {
        const res = await fetch(`/api/autocomplete?q=${input}&category=${category}`);
        const data = await res.json();

        // LOGGING FOR DEBUGGING
        console.log('API response data:', data);

        if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.map((name: string) => ({ name })));
        } else if (Array.isArray(data.results)) {
          setSuggestions(data.results);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
        setSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [input, category, locked, hasFocused]);

  const handleSelect = (item: { name: string; id?: number; image?: string }) => {
    setInput(item.name);
    setLocked(true);
    setSuggestions([]);
    onSelect(
      item.name,
      item.id ? { id: item.id, image: item.image ?? '' } : undefined
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder={`Search ${category.toLowerCase()}s...`}
        value={input}
        onFocus={() => setHasFocused(true)}
        onChange={(e) => {
          setInput(e.target.value);
          setLocked(false);
        }}
      />
      {suggestions.length > 0 && !locked && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.name}
              onClick={() => handleSelect(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              {s.image && (
                <img src={s.image} alt={s.name} className="w-8 h-8 object-cover rounded" />
              )}
              <span>{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}