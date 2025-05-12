'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSearch, SearchProvider } from '@/context/SearchContext';
import { SearchBar } from '@/components/SearchBar';
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem
} from '@/components/ui/navigation-menu';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plane, Menu, PenLine, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const generateInitials = (displayName: string | undefined | null): string => {
  if (!displayName) return 'TT';
  
  const names = displayName.trim().split(/\s+/);
  
  if (names.length === 0) return 'TT';
  
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  
  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);
  
  return (firstInitial + lastInitial).toUpperCase();
};

const TravelBlogLayoutContent = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setAllBlogs } = useSearch();
  const [userData, setUserData] = useState<{
    id: string | null;
    initials: string;
  }>({
    id: null,
    initials: 'TT'
  });
  
  const pathname = usePathname();

  useEffect(() => {
    const fetchBlogsForSearch = async () => {
      try {
        const authToken = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken') 
          : null;
        
        const response = await fetch('/api/blogs', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs for search: ${response.status}`);
        }
        
        const data = await response.json();
        setAllBlogs(data.data || []);
      } catch (error) {
        console.error('Error fetching blogs for search:', error);
      }
    };

    fetchBlogsForSearch();
  }, [setAllBlogs]);

  useEffect(() => {
    (function loadUserData() {
      if (typeof window === 'undefined') return;

      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        
        const parsedUser = JSON.parse(storedUser);
        
        setUserData({
          id: parsedUser?.id || null,
          initials: generateInitials(parsedUser?.display_name)
        });
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    })();
  }, []);

  const isLinkActive = useCallback((href: string) => {
    return pathname === href;
  }, [pathname]);

  const navItems = useMemo(() => [
    { href: '/admin', label: 'Home' },
    { href: '/admin/countries', label: 'Countries' }
  ], []);

  const profileLink = useMemo(() => 
    userData.id ? `/admin/profile/${userData.id}` : '/admin/profile/'
  , [userData.id]);

  return (
    <div className="flex flex-col min-h-screen">

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 hidden md:block">
        <div className="container mx-auto h-full grid grid-cols-3 items-center">

          <div className="flex items-center">
            <Link href="/admin" className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold">Travel Tales</span>
            </Link>
          </div>

          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-4">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link 
                      href={item.href} 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                        isLinkActive(item.href) ? 'bg-accent/50' : 'bg-background'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex justify-end items-center space-x-4">
            <SearchBar 
              className="w-48" 
              hideOnMobile={true} 
              onSearch={() => {}}
            />

            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1"
              asChild
            >
              <Link href="/admin/blog/create">
                <PenLine className="h-4 w-4" aria-hidden="true" />
                <span>Create</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden" aria-label="User menu">
                  <Avatar className="h-8 w-8 aspect-square">
                    <AvatarFallback>{userData.initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2 py-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <Link href={profileLink} className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 py-2 text-red-500 focus:text-red-500">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <Link href="/sign-out" className="w-full">Sign Out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 md:hidden">
        <div className="container mx-auto h-full flex items-center justify-between">

          <Link href="/admin" className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold">Travel Tales</span>
          </Link>

          <div className="flex items-center space-x-2">

            <Button 
              variant="default" 
              size="sm"
              className="flex items-center"
              asChild
              aria-label="Create new post"
            >
              <Link href="/admin/blog/create">
                <PenLine className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden" aria-label="User menu">
                  <Avatar className="h-8 w-8 aspect-square">
                    <AvatarFallback>{userData.initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2 py-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <Link href={profileLink} className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 py-2 text-red-500 focus:text-red-500">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <Link href="/sign-out" className="w-full">Sign Out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Travel Tales</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <SearchBar 
                    placeholder="Search..." 
                    onSearch={() => setIsOpen(false)} 
                  />

                  <nav className="flex flex-col space-y-4 py-6">
                    {navItems.map((item) => (
                      <SheetClose key={item.href} asChild>
                        <Link 
                          href={item.href}
                          className={`flex py-2 px-3 rounded-md hover:bg-accent font-medium ${
                            isLinkActive(item.href) ? 'bg-accent/50 text-accent-foreground' : ''
                          }`}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto py-6 px-4 md:px-6">
          {children}
        </div>
      </main>

      <footer className="border-t py-6 md:py-0 md:h-16">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:px-6 h-full md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Travel Tales Travel Blog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function TravelBlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SearchProvider>
      <TravelBlogLayoutContent>
        {children}
      </TravelBlogLayoutContent>
    </SearchProvider>
  );
}