'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Send, 
  Loader2, 
  Clock,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CountryInfoCard from '@/components/CountryInfoCard';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: string;
  user_id: string;
  blog_id: string;
  comment: string;
  created_at?: string;
  display_name: string;
}

interface BlogPost {
  id: string;
  title: string;
  user_id: string;
  content: string;
  country_code: string;
  country_name: string;
  created_at: string;
  likes: {
    count: number;
    likedBy: {
      id: string;
      user_id: string;
      blog_id: string;
      liked_at: string;
    }[];
  };
  comments: {
    count: number;
    commentedBy: Comment[];
  };
  user: {
    display_name: string;
    email: string;
  }
}

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [loadingCountryInfo, setLoadingCountryInfo] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/blogs/${params.id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog post: ${response.status}`);
        }
        
        const data = await response.json();
        setBlog(data.data);
        setLikeCount(data.data.likes?.count || 0);

        const userId = user ? user.id : null;
        setIsAuthor(userId === data.data.user_id);

        const hasLiked = userId ? data.data.likes?.likedBy?.some((like: { user_id: string }) => like.user_id === userId) : false;
        setLiked(hasLiked);
        
        setComments(data.data.comments?.commentedBy || []);

        if (data.data.country_code) {
          fetchCountryInfo(data.data.country_code);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCountryInfo = async (countryCode: string) => {
      try {
        setLoadingCountryInfo(true);
        
        const response = await fetch(`/api/countries/${countryCode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            searchType: 'alpha',
            searchQuery: countryCode
          })
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch country info: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        setCountryInfo(data[0]);
      } catch (error) {
        console.error('Error fetching country info:', error);
      } finally {
        setLoadingCountryInfo(false);
      }
    };

    if (params.id) {
      fetchBlogPost();
    }
  }, [params.id, user]);

  const handleLike = async () => {

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      
      const response = await fetch(`/api/blogs/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          blog_id: params.id
         })
      });
      
      if (!response.ok) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
        throw new Error('Failed to update like status');
      }
      
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like status. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
      
      toast.success('Blog post deleted successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      setSubmittingComment(true);
      
      const response = await fetch(`/api/blogs/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          blog_id: params.id,
          comment: commentText 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      const responseData = await response.json();

      const newComment: Comment = {
        id: responseData.data.id,
        user_id: responseData.data.user_id,
        blog_id: responseData.data.blog_id,
        comment: responseData.data.comment,
        created_at: responseData.data.created_at,
        display_name: responseData.data.user?.display_name || 'Anonymous'
      };
      
      setComments(prevComments => [newComment, ...prevComments]);
      setCommentText('');
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
        </div>
        
        <div className="mb-8">
          <div className="h-8 w-40 bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-10 w-full bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6"></div>
        </div>
        
        <div className="h-64 w-full bg-muted animate-pulse rounded mb-10"></div>
        
        <div className="h-[400px] w-full bg-muted animate-pulse rounded mb-8"></div>
        
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="bg-red-50 p-6 rounded-lg max-w-lg">
            <h3 className="text-red-800 font-medium text-lg mb-2">Something went wrong</h3>
            <p className="text-red-700">{error || 'Blog post not found'}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => router.push('/admin')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-2 flex items-center text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stories
        </Button>
        
        {isAuthor && (
          <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/blog/edit/${blog.id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your story
              and remove all associated data including comments and likes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Story"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8 min-h-[120px]">
        <div className="flex flex-wrap gap-2 items-center mb-4 min-h-[24px]">
          <Badge variant="outline" className="flex items-center gap-1 h-6">
            <MapPin className="h-3 w-3" />
            {blog.country_name}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center h-6">
            <Clock className="h-3 w-3 mr-1" />
            {format(new Date(blog.created_at), 'MMMM d, yyyy')}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 min-h-[2.5rem] md:min-h-[3rem]">{blog.title}</h1>
        
        <div className="flex items-center mb-6 h-8">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>{blog.user.display_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span 
            className="text-sm font-medium cursor-pointer hover:underline"
            onClick={() => router.push(`/admin/profile/${blog.user_id}`)}
          >
            {blog.user.display_name || 'Anonymous'}
          </span>
        </div>
      </div>

      <CountryInfoCard
        country={countryInfo}
        loading={loadingCountryInfo}
        className="mb-10 bg-muted/30"
      />
      
      <div className="prose prose-lg max-w-none mb-10 min-h-[300px] will-change-contents">
        <div className="w-full" style={{ minHeight: '300px', contain: 'layout' }}>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </div>

      <div className="flex items-center space-x-6 mb-8">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${liked ? 'text-red-500' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => commentInputRef.current?.focus()}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </Button>
      </div>
      
      <Separator className="my-6" />

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Leave a Comment</h3>
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <Textarea
            ref={commentInputRef}
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={submittingComment || !commentText.trim()}
              className="flex items-center"
            >
              {submittingComment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post Comment
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="min-h-[200px]">
        <h3 className="text-lg font-medium mb-4">Comments ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <MessageCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.display_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span 
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => router.push(`/admin/profile/${comment.user_id}`)}
                        >
                          {comment.display_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Unknown time'}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}