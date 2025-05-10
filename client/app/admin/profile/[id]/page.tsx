'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import { useParams } from 'next/navigation';

export default function Profile() {
  const params = useParams();
  const userId = params.id;
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!userId) {
        setError('User ID not found in URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching user blogs for userId:', userId);
        const response = await fetch(`/api/blogs/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user blogs: ${response.status}`);
        }
        
        const data = await response.json();
        setBlogs(data.data || []);
      } catch (error) {
        console.error('Error fetching user blogs:', error);
        setError('Failed to load user\'s travel stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [userId]);

  // Console log to debug params
  useEffect(() => {
    console.log('URL params:', params);
  }, [params]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-md text-muted-foreground">Loading user's travel stories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <div className="bg-red-50 p-4 rounded-lg max-w-lg mx-auto">
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

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Travel Stories</h2>
        <Button asChild className="flex items-center gap-1">
          <Link href="/admin/blog/create">
            <PlusCircle className="h-4 w-4" />
            New Story
          </Link>
        </Button>
      </div>
      
      {blogs.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't shared any travel stories yet.
          </p>
          <Button asChild>
            <Link href="/admin/blog/create">Create Your First Story</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
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