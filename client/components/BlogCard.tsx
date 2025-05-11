'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  MapPin, 
  Clock, 
  Heart, 
  MessageCircle,
  User
} from 'lucide-react';

export interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  country_code: string;
  country_name?: string;
  likes: {
    count: number;
  };
  comments: {
    count: number;
  };
  created_at: string;
  user: {
    display_name: string;
    email: string;
  }
}

interface BlogCardProps {
  blog: BlogPost;
  linkPath?: string; 
}

const getExcerpt = (htmlContent: string, maxLength = 150) => {
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText;
};

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  linkPath = `/admin/blog/read/${blog.id}` 
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {blog.country_name}
          </Badge>
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-xl">{blog.title}</CardTitle>
        <Link 
          href={`/admin/profile/${blog.user_id}`} 
          className="flex items-center text-sm text-muted-foreground hover:text-primary mt-1"
        >
          <User className="h-3 w-3 mr-1" />
          <span>{blog.user.display_name}</span>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">
          {getExcerpt(blog.content)}
        </p>
      </CardContent>
      
      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Heart className="h-4 w-4 mr-1 text-red-500" />
            <span>{blog.likes?.count || 0}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
            <span>{blog.comments?.count || 0}</span>
          </div>
        </div>
        <Button variant="ghost" className="flex items-center" asChild>
          <Link href={linkPath}>
            Read More
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;