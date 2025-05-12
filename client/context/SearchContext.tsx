'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Fuse from 'fuse.js';
import { BlogPost } from '@/components/BlogCard';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'title' | 'user';
  blog: BlogPost;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  allBlogs: BlogPost[];
  setAllBlogs: (blogs: BlogPost[]) => void;
  clearSuggestions: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!searchQuery.trim() || allBlogs.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      const fuse = new Fuse(allBlogs, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'user.display_name', weight: 1 }
        ],
        includeScore: true,
        threshold: 0.4,
        minMatchCharLength: 2
      });

      const results = fuse.search(searchQuery);

      const newSuggestions: SearchSuggestion[] = [];

      const addedTitles = new Set<string>();
      const addedCountries = new Set<string>();
      const addedUsers = new Set<string>();

      results.slice(0, 10).forEach(result => {
        const blog = result.item;

        if (blog.title && !addedTitles.has(blog.title) && newSuggestions.length < 5) {
          addedTitles.add(blog.title);
          newSuggestions.push({
            id: `title-${blog.id}`,
            text: blog.title,
            type: 'title',
            blog
          });
        }

        if (blog.user?.display_name && !addedUsers.has(blog.user.display_name) && newSuggestions.length < 5) {
          addedUsers.add(blog.user.display_name);
          newSuggestions.push({
            id: `user-${blog.user.user_id}`,
            text: blog.user.display_name,
            type: 'user',
            blog
          });
        }
      });

      setSuggestions(newSuggestions);
      setIsLoading(false);
    };

    const timeout = setTimeout(() => {
      generateSuggestions();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, allBlogs]);

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      isSearchActive, 
      setIsSearchActive,
      suggestions,
      isLoading,
      allBlogs,
      setAllBlogs,
      clearSuggestions
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}