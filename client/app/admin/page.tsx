'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';

const BlogLand = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const authToken = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken') 
          : null;
        
        const response = await fetch('/api/blogs', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to fetch blogs: ${response.status}`
          );
        }
        
        const data = await response.json();
        setBlogs(data.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Failed to load blog posts. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-full max-w-md" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg border border-red-100 shadow-sm">
          <h3 className="text-red-800 font-medium text-lg mb-2">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 hover:bg-red-50" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center py-16 max-w-lg mx-auto">
          <div className="mb-6 p-4 bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No travel stories yet</h2>
          <p className="text-muted-foreground mb-8">
            Be the first to share your amazing travel experiences!
          </p>
          <Button asChild size="lg" className="font-medium">
            <Link href="/admin/blog/create">Create Your First Story</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Travel Stories</h1>
          <p className="text-muted-foreground">
            Explore travel experiences from around the world
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0" size="sm">
          <Link href="/admin/blog/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Story
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id} 
            blog={blog} 
            linkPath={`/admin/blog/read/${blog.id}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default BlogLand;