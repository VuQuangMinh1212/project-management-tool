"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchSuggestion {
  value: string;
  category?: string;
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SearchWithSuggestions({
  placeholder = "Search...",
  value,
  onChange,
  suggestions = [],
  onSuggestionSelect,
  className,
  disabled = false,
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on search term
  const filteredSuggestions = useMemo(() => {
    if (!value || value.length < 2 || disabled) return [];

    const searchLower = value.toLowerCase();
    return suggestions
      .filter(suggestion => 
        suggestion.value.toLowerCase().includes(searchLower) &&
        suggestion.value.toLowerCase() !== searchLower
      )
      .slice(0, 8); // Limit to 8 suggestions
  }, [value, suggestions, disabled]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.length >= 2 && filteredSuggestions.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setIsFocused(false);
    onSuggestionSelect?.(suggestion);
  };

  const clearSearch = () => {
    onChange("");
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (filteredSuggestions.length > 0 && value.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.absolute.top-full')) {
      return;
    }
    
    setIsFocused(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              setIsFocused(false);
              e.currentTarget.blur();
            } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
              e.preventDefault();
            }
          }}
          className="pl-10 pr-10"
          disabled={disabled}
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Custom dropdown positioned below input */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                Suggestions
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion.value)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4 text-gray-400" />
                    {suggestion.value}
                  </div>
                  {suggestion.category && (
                    <span className="text-xs text-gray-400">{suggestion.category}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
