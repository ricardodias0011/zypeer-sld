import React, { useEffect, useState } from 'react';

type valueComplete = { label: string, value: string }

interface AutoCompleteProps {
  data: valueComplete[];
  onSelect: (a: string) => void;
  value?: string;
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({ data, onSelect, value }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<valueComplete[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filteredSuggestions = data.filter(item =>
        item.label.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: valueComplete) => {
    setInputValue(suggestion.label);
    onSelect(suggestion.value)
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (value) {
      const findItem = data?.find(a => a.value === value);
      setInputValue(findItem?.label ?? "")
    }
  }, [value])

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => inputValue && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => {
          setShowSuggestions(false);
          if (!value) {
            const newValue = data?.find(a => a.value === inputValue);
            if (newValue) {
              handleSuggestionClick(newValue);
            } else {
              handleSuggestionClick({ label: "", value: "" })
            }
          } else {
            const newValue = data?.find(a => a.value === value);

            handleSuggestionClick(newValue ?? { label: "", value: "" })

          }
        }, 100)}
        className="box-border inline-flex w-full h-[45px] bg-transparent w-full appearance-none items-center border justify-center rounded px-2.5 text-[16px] leading-none outline-none"
        placeholder="Digite para buscar..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-secondary border rounded-md max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 cursor-pointer bg-transparent"
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};