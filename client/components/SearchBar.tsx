'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, MapPin, User, FileText, Loader2 } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useOnClickOutside } from '@/hooks/UseOnClickOutside';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch?: () => void;
  className?: string;
  placeholder?: string;
  hideOnMobile?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className = '',
  placeholder = 'Search...',
  hideOnMobile = false
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    suggestions, 
    isLoading,
    clearSuggestions
  } = useSearch();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle click outside to close suggestions
  useOnClickOutside(searchRef, () => {
    clearSuggestions();
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      clearSuggestions();
      if (onSearch) onSearch();
    }
  };

  const handleSuggestionClick = (suggestion: {
    type: string;
    text: string;
    blog: { id: string; country_name?: string; user?: { user_id: string } }
  }) => {
    switch (suggestion.type) {
      case 'title':
        router.push(`/admin/blog/read/${suggestion.blog.id}`);
        break;
      case 'user':
        if (suggestion.blog.user?.user_id) {
          router.push(`/admin/profile/${encodeURIComponent(suggestion.blog.user.user_id)}`);
        }
        break;
    }
    
    clearSuggestions();
    setSearchQuery('');
  };

  const getIconForSuggestionType = (type: string) => {
    switch (type) {
      case 'title':
        return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'country':
        return <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'user':
        return <User className="h-4 w-4 mr-2 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 mr-2 text-muted-foreground" />;
    }
  };

  // Focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div 
      ref={searchRef} 
      className={`relative ${hideOnMobile ? 'hidden md:block' : ''} ${className}`}
    >
      <form onSubmit={handleSearch} className="relative w-full">
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className="pr-8 h-9 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search the site"
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          aria-label="Submit search"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </form>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-50 max-h-[300px] overflow-y-auto w-64 md:w-80">
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center w-full">
                    {getIconForSuggestionType(suggestion.type)}
                    <div className="flex flex-col w-full">
                      <span className="font-medium">
                        {suggestion.text}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.type === 'title' ? 'Story' : 'User'}
                      </span>
                    </div>
                  </div>
                </Button>
              </li>
            ))}
            {searchQuery.trim() && (
              <li className="border-t border-muted mt-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm text-primary"
                  onClick={() => handleSearch(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span>Search for "{searchQuery}"</span>
                </Button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};