'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, UserPlus, Check, Users } from 'lucide-react';
import BlogCard, { BlogPost } from '@/components/BlogCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type FollowUser = {
  id: string;
  follower_id?: string;
  following_id?: string;
  followed_at: string;
  display_name: string;
};

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
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

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

        const userResponse = await fetch(`/api/auth/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserDisplayName(userData.data.user.display_name || "User");
          setFollowers(userData.data.user.followers || []);
          setFollowing(userData.data.user.following || []);

          if (loggedInUserId && userData.data.user.followers) {
            const isAlreadyFollowing = userData.data.user.followers.some(
              (follower: FollowUser) => follower.follower_id === loggedInUserId
            );
            setIsFollowing(isAlreadyFollowing);
          }
        } else {
          throw new Error(`Failed to fetch user profile: ${userResponse.status}`);
        }

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
    
      const response = await fetch(`/api/auth/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);

        const userResponse = await fetch(`/api/auth/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setFollowers(userData.data.user.followers || []);
        }
      } else {
        throw new Error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const navigateToUserProfile = (userId: string) => {
    window.location.href = `/admin/profile/${userId}`;
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-10 w-48" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Card className="mx-auto max-w-lg border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700">Something went wrong</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Card className="mb-8 border-none shadow-sm bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">
                {isOwnProfile ? "My Travel Stories" : `${userDisplayName}'s Travel Stories`}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Sharing adventures from around the world
              </CardDescription>
            </div>
            
            {isOwnProfile ? (
              <Button asChild size="lg" className="flex items-center gap-2 md:self-start">
                <Link href="/admin/blog/create">
                  <PlusCircle className="h-5 w-5" />
                  New Story
                </Link>
              </Button>
            ) : (
              <Button 
                variant={isFollowing ? "outline" : "default"}
                size="lg"
                className="flex items-center gap-2 md:self-start transition-all"
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-1" />
                ) : isFollowing ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 pl-1 text-sm hover:bg-slate-100"
              onClick={() => setShowFollowersDialog(true)}
            >
              <Badge variant="outline" className="px-2 py-1 text-base mr-1">
                {followers.length}
              </Badge>
              <span>Followers</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 pl-1 text-sm hover:bg-slate-100"
              onClick={() => setShowFollowingDialog(true)}
            >
              <Badge variant="outline" className="px-2 py-1 text-base mr-1">
                {following.length}
              </Badge>
              <span>Following</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {blogs.length === 0 ? (
        <Card className="text-center py-12 border border-dashed bg-slate-50">
          <CardContent className="pt-6">
            <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PlusCircle className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-xl font-medium mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isOwnProfile 
                ? "You haven't shared any travel stories yet. Start documenting your adventures!"
                : `${userDisplayName} hasn't shared any travel stories yet.`}
            </p>
            {isOwnProfile && (
              <Button asChild size="lg" className="px-6">
                <Link href="/admin/blog/create">Create Your First Story</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              linkPath={`/admin/blog/read/${blog.id}`} 
            />
          ))}
        </div>
      )}
      
      <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Followers</DialogTitle>
            <DialogDescription>
              People who follow {isOwnProfile ? "you" : userDisplayName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto pr-2">
            {followers.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No followers yet</p>
              </div>
            ) : (
              <ul className="divide-y">
                {followers.map((follower) => (
                  <li key={follower.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 bg-primary/10">
                          <AvatarFallback className="text-primary font-medium">
                            {follower.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="ml-3 font-medium">{follower.display_name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-full"
                        onClick={() => navigateToUserProfile(follower.follower_id || '')}
                      >
                        View Profile
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Following</DialogTitle>
            <DialogDescription>
              People {isOwnProfile ? "you follow" : `${userDisplayName} follows`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto pr-2">
            {following.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You're not following anyone yet" : `${userDisplayName} isn't following anyone yet`}
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {following.map((follow) => (
                  <li key={follow.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 bg-primary/10">
                          <AvatarFallback className="text-primary font-medium">
                            {follow.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="ml-3 font-medium">{follow.display_name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-full"
                        onClick={() => navigateToUserProfile(follow.following_id || '')}
                      >
                        View Profile
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}