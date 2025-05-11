'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, UserPlus, Check } from 'lucide-react';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import { useParams } from 'next/navigation';

export default function Profile() {
  const params = useParams();
  const userId = params.id;
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID not found in URL');
        setLoading(false);
        return;
      }

      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      const loggedInUserId = userData ? userData.id : null;
      setIsOwnProfile(userId === loggedInUserId);

      try {
        setLoading(true);
        console.log('Fetching user data for userId:', userId);
        
        const blogsResponse = await fetch(`/api/blogs/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!blogsResponse.ok) {
          throw new Error(`Failed to fetch user blogs: ${blogsResponse.status}`);
        }
        
        const blogsData = await blogsResponse.json();
        setBlogs(blogsData.data || []);

        if (blogsData.data && blogsData.data.length > 0 && blogsData.data[0].user) {
          setUserDisplayName(blogsData.data[0].user.display_name || "User");
        } else {

          const userResponse = await fetch(`/api/auth/profile/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserDisplayName(userData.data.user.display_name || "User");
          }
        }

        if (!isOwnProfile && loggedInUserId) {
          try {
            const followResponse = await fetch(`/api/follow/check`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                followee_id: userId
              })
            });
            
            if (followResponse.ok) {
              const followData = await followResponse.json();
              setIsFollowing(followData.isFollowing || false);
            }
          } catch (error) {
            console.error('Error checking follow status:', error);
          }
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user\'s travel stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFollow = async () => {
    if (followLoading) return;
    
    try {
      setFollowLoading(true);
      
      const endpoint = isFollowing ? `/api/follow/unfollow` : `/api/follow`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          followee_id: userId
        })
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        throw new Error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setFollowLoading(false);
    }
  };

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
        <h2 className="text-2xl font-semibold">
          {isOwnProfile ? "My Travel Stories" : `${userDisplayName}'s Travel Stories`}
        </h2>
        
        {isOwnProfile ? (
          <Button asChild className="flex items-center gap-1">
            <Link href="/admin/blog/create">
              <PlusCircle className="h-4 w-4" />
              New Story
            </Link>
          </Button>
        ) : (
          <Button 
            variant={isFollowing ? "outline" : "default"}
            className="flex items-center gap-1"
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : isFollowing ? (
              <Check className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>
      
      {blogs.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {isOwnProfile 
              ? "You haven't shared any travel stories yet."
              : `${userDisplayName} hasn't shared any travel stories yet.`}
          </p>
          {isOwnProfile && (
            <Button asChild>
              <Link href="/admin/blog/create">Create Your First Story</Link>
            </Button>
          )}
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