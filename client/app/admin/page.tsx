'use client';

import React, { useState, useEffect, useMemo, JSX } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext'; 
import BlogCard, { BlogPost } from '@/components/BlogCard';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Filter, X, Search, ArrowUpDown, SortAsc, SortDesc } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const ALL_COUNTRIES = "all_countries";
const ALL_USERS = "all_users";

type SortOption = 'newest' | 'oldest' | 'most_likes' | 'least_likes' | 'most_comments' | 'least_comments';

interface BlogLandState {
  blogs: BlogPost[];
  followedBlogs: BlogPost[];
  loading: boolean;
  followedLoading: boolean;
  error: string | null;
  followedError: string | null;
  activeTab: string;
  selectedCountry: string;
  selectedUser: string;
  sortBy: SortOption;
}

interface UserData {
  id: string;
  name: string;
}

const BlogLand: React.FC = () => {
  const [state, setState] = useState<BlogLandState>({
    blogs: [],
    followedBlogs: [],
    loading: true,
    followedLoading: true,
    error: null,
    followedError: null,
    activeTab: "all",
    selectedCountry: ALL_COUNTRIES,
    selectedUser: ALL_USERS,
    sortBy: 'newest'
  });

  const { isAuthenticated } = useAuth();
  
  const { 
    blogs, followedBlogs, loading, followedLoading, error, followedError, 
    activeTab, selectedCountry, selectedUser, sortBy
  } = state;

  const updateState = (newState: Partial<BlogLandState>): void => {
    setState(prev => ({ ...prev, ...newState }));
  };

  useEffect(() => {
    const fetchData = async (
      endpoint: string, 
      method: string = 'GET', 
      stateKey: keyof Pick<BlogLandState, 'blogs' | 'followedBlogs'>,
      loadingKey: keyof Pick<BlogLandState, 'loading' | 'followedLoading'>,
      errorKey: keyof Pick<BlogLandState, 'error' | 'followedError'>
    ): Promise<void> => {
      try {
        updateState({ [loadingKey]: true } as Partial<BlogLandState>);

        const response = await fetch(endpoint, {
          method,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        updateState({ [stateKey]: data.data || [] } as Partial<BlogLandState>);
      } catch (error) {
        console.error(`Error fetching ${stateKey}:`, error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load. Please try again later.';
        updateState({ [errorKey]: errorMessage } as Partial<BlogLandState>);
      } finally {
        updateState({ [loadingKey]: false } as Partial<BlogLandState>);
      }
    };


    fetchData('/api/blogs', 'GET', 'blogs', 'loading', 'error');

    if (isAuthenticated) {
      fetchData('/api/blogs/users', 'POST', 'followedBlogs', 'followedLoading', 'followedError');
    }
}, [isAuthenticated]);

  const { uniqueCountries, uniqueUsers } = useMemo(() => {
    const currentBlogs = activeTab === "all" ? blogs : followedBlogs;

    const countries = new Set<string>();

    const usersMap = new Map<string, UserData>();
    
    currentBlogs.forEach(blog => {

      if (blog.country_name) countries.add(blog.country_name);

      if (blog.user?.display_name) {
        usersMap.set(blog.user.user_id, {
          id: blog.user.user_id,
          name: blog.user.display_name
        });
      }
    });
    
    return {
      uniqueCountries: Array.from(countries).sort(),
      uniqueUsers: Array.from(usersMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [blogs, followedBlogs, activeTab]);

  const filteredAndSortedBlogs = useMemo(() => {
    const currentBlogs = activeTab === "all" ? blogs : followedBlogs;

    const filtered = currentBlogs.filter(blog => 
      (selectedCountry === ALL_COUNTRIES || blog.country_name === selectedCountry) &&
      (selectedUser === ALL_USERS || (blog.user && blog.user.user_id === selectedUser))
    );

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_likes':
          return (b.likes.count || 0) - (a.likes.count || 0);
        case 'least_likes':
          return (a.likes.count || 0) - (b.likes.count || 0);
        case 'most_comments':
          return (b.comments.count || 0) - (a.comments.count || 0);
        case 'least_comments':
          return (a.comments.count || 0) - (b.comments.count || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [blogs, followedBlogs, activeTab, selectedCountry, selectedUser, sortBy]);

  const clearFilters = (): void => {
    updateState({ 
      selectedCountry: ALL_COUNTRIES, 
      selectedUser: ALL_USERS 
    });
  };

  const renderLoadingState = (): JSX.Element => (
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

  const renderError = (errorMessage: string): JSX.Element => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-50 p-6 rounded-lg max-w-lg border border-red-100 shadow-sm">
        <h3 className="text-red-800 font-medium text-lg mb-2">Something went wrong</h3>
        <p className="text-red-700">{errorMessage}</p>
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

  const renderEmptyState = (isFiltered: boolean): JSX.Element => (
    <div className="text-center py-16 max-w-lg mx-auto">
      {isFiltered ? (
        <>
          <div className="mb-6 p-4 bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Filter className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No matching stories</h2>
          <p className="text-muted-foreground mb-8">No stories match your current filters.</p>
          <Button variant="outline" onClick={clearFilters} className="font-medium">
            <X className="mr-2 h-4 w-4" />Clear Filters
          </Button>
        </>
      ) : (
        <>
          <div className="mb-6 p-4 bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {activeTab === "followed" ? "No stories from followed users" : "No travel stories yet"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {activeTab === "followed" 
              ? "Follow more users to see their travel stories here!" 
              : "Be the first to share your amazing travel experiences!"}
          </p>
          {activeTab === "all" && (
            <Button asChild size="lg" className="font-medium">
              <Link href="/admin/blog/create">Create Your First Story</Link>
            </Button>
          )}
        </>
      )}
    </div>
  );

  const renderTabContent = (tabKey: string): JSX.Element => {
    const isAllTab = tabKey === "all";
    const isLoading = isAllTab ? loading : followedLoading;
    const currentError = isAllTab ? error : followedError;
    const hasFilters = selectedCountry !== ALL_COUNTRIES || selectedUser !== ALL_USERS;
    const currentBlogs = isAllTab ? blogs : followedBlogs;

    if (isLoading) return renderLoadingState();
    if (currentError) return renderError(currentError);
    if (currentBlogs.length === 0) return renderEmptyState(false);
    if (hasFilters && filteredAndSortedBlogs.length === 0) return renderEmptyState(true);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredAndSortedBlogs.map((blog) => (
          <BlogCard
            key={blog.id} 
            blog={blog} 
            linkPath={`/admin/blog/read/${blog.id}`} 
          />
        ))}
      </div>
    );
  };

  const hasActiveFilters = selectedCountry !== ALL_COUNTRIES || selectedUser !== ALL_USERS;

  const getSortDisplayText = (option: SortOption): string => {
    switch (option) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'most_likes': return 'Most Likes';
      case 'least_likes': return 'Least Likes';
      case 'most_comments': return 'Most Comments';
      case 'least_comments': return 'Least Comments';
      default: return 'Sort By';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Travel Stories</h1>
          <p className="text-muted-foreground">Explore travel experiences from around the world</p>
        </div>
        <Button asChild className="mt-4 md:mt-0" size="sm">
          <Link href="/admin/blog/create">
            <PlusCircle className="mr-2 h-4 w-4" />New Story
          </Link>
        </Button>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="mb-6"
        onValueChange={(value) => {
          updateState({ activeTab: value });
          clearFilters();
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            { isAuthenticated ? <TabsList>
              <TabsTrigger value="all">All Stories</TabsTrigger>
              <TabsTrigger value="followed">Following</TabsTrigger>
            </TabsList> : <p></p>}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="w-full sm:w-auto flex items-center">
              <Select 
                value={sortBy} 
                onValueChange={(value) => updateState({ sortBy: value as SortOption })}
              >
                <SelectTrigger className="w-full sm:w-48 h-9">
                  <div className="flex items-center">
                    {sortBy.includes('most') || sortBy === 'newest' ? 
                      <SortDesc className="mr-2 h-4 w-4" /> : 
                      <SortAsc className="mr-2 h-4 w-4" />
                    }
                    <span>{getSortDisplayText(sortBy)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_likes">Most Likes</SelectItem>
                  <SelectItem value="least_likes">Least Likes</SelectItem>
                  <SelectItem value="most_comments">Most Comments</SelectItem>
                  <SelectItem value="least_comments">Least Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="w-full sm:w-auto p-1 border border-muted flex flex-row items-center gap-3 max-w-md">
              <div className="flex items-center border-r border-muted pr-3 pl-2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex-1 flex flex-row gap-2">
                <Select 
                  value={selectedCountry} 
                  onValueChange={(value) => updateState({ selectedCountry: value })}
                >
                  <SelectTrigger className="w-full border-0 h-8 px-2 text-sm bg-transparent focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_COUNTRIES}>All Countries</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-muted-foreground self-center">|</span>
                
                <Select 
                  value={selectedUser} 
                  onValueChange={(value) => updateState({ selectedUser: value })}
                >
                  <SelectTrigger className="w-full border-0 h-8 px-2 text-sm bg-transparent focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_USERS}>All Users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearFilters}
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear filters</span>
                </Button>
              )}
            </Card>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCountry !== ALL_COUNTRIES && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Country: {selectedCountry}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => updateState({ selectedCountry: ALL_COUNTRIES })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove country filter</span>
                </Button>
              </Badge>
            )}
            
            {selectedUser !== ALL_USERS && (
              <Badge variant="secondary" className="flex items-center gap-1">
                User: {uniqueUsers.find(u => u.id === selectedUser)?.name || selectedUser}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => updateState({ selectedUser: ALL_USERS })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove user filter</span>
                </Button>
              </Badge>
            )}
          </div>
        )}
        
        <TabsContent value="all">{renderTabContent("all")}</TabsContent>
        <TabsContent value="followed">{renderTabContent("followed")}</TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogLand;