'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import { Skeleton } from '@/components/ui/skeleton';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import { Search } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { allBlogs, setSearchQuery } = useSearch();
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  useEffect(() => {
    setLoading(true);
    
    try {
      if (!query || allBlogs.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      const fuse = new Fuse(allBlogs, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'content', weight: 1 },
          { name: 'country_name', weight: 1.5 },
          { name: 'user.display_name', weight: 1 }
        ],
        includeScore: true,
        threshold: 0.4,
        minMatchCharLength: 2
      });

      const searchResults = fuse.search(query);
      setResults(searchResults.map(result => result.item));
    } catch (err) {
      console.error('Error performing search:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, allBlogs]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-full max-w-md" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-64 w-full">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg border border-red-100 shadow-sm">
          <h3 className="text-red-800 font-medium text-lg mb-2">Search Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          {results.length > 0 
            ? `Found ${results.length} ${results.length === 1 ? 'result' : 'results'} for "${query}"`
            : `No results found for "${query}"`}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 max-w-lg mx-auto">
          <div className="mb-6 p-4 bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No matching stories</h2>
          <p className="text-muted-foreground mb-8">
            Try using different keywords or checking for spelling errors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {results.map((blog) => (
            <BlogCard
              key={blog.id} 
              blog={blog} 
              linkPath={`/admin/blog/read/${blog.id}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}