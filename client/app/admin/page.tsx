'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import BlogCard, { BlogPost } from '@/components/BlogCard';

const BlogLand = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blogs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }
        
        const data = await response.json();
        setBlogs(data.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading travel stories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg">
          <h3 className="text-red-800 font-medium text-lg mb-2">Something went wrong</h3>
          <p className="text-red-700">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
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
      <div className="container mx-auto p-6">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">No travel stories yet</h2>
          <p className="text-muted-foreground mb-8">
            Be the first to share your amazing travel experiences!
          </p>
          <Button asChild>
            <Link href="/admin/blog/create">Create Your First Story</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Travel Stories</h1>
        <p className="text-muted-foreground">
          Explore travel experiences from around the world
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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