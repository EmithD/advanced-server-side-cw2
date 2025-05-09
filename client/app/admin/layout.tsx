'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { Plane, Menu, Search, PenLine } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

export default function TravelBlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserId(parsedUser?.id || null);
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    // You could redirect to a search results page, e.g.:
    // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
        <div className="container mx-auto grid grid-cols-3 h-16 items-center">
          <div className="flex items-start">
            <Link href="/admin" className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Travel Tales</span>
            </Link>
          </div>

          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-4">
                <NavigationMenuItem>
                  <Link 
                    href="/admin" 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/admin/about"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    About
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/admin/help"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    Help
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <div className="flex justify-end items-center space-x-4">

            <form onSubmit={handleSearch} className="relative w-48">
              <Input
                type="search"
                placeholder="Search..."
                className="pr-8 h-9 w-full"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
            
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1"
              asChild
            >
              <Link href="/admin/blog/create">
                <PenLine className="h-4 w-4" />
                <span>Create</span>
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>WT</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Link href={userId ? `/admin/profile/${userId}` : '/admin/profile/'} className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/sign-out" className="w-full">Sign Out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Travel Tales</span>
          </Link>

          <div className="flex items-center space-x-2">

            <Button 
              variant="default" 
              size="sm"
              className="flex items-center"
              asChild
            >
              <Link href="/admin/blog/create">
                <PenLine className="h-4 w-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>WT</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Link href={userId ? `/admin/profile/${userId}` : '/admin/profile/'} className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/sign-out" className="w-full">Sign Out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Travel Tales</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  
                  <form onSubmit={handleSearch} className="relative mt-6 mb-2">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pr-8"
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      aria-label="Search"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </form>

                  <nav className="flex flex-col space-y-4 py-6">
                    <SheetClose asChild>
                      <Link 
                        href="/admin"
                        className="flex py-2 px-3 rounded-md hover:bg-accent font-medium"
                      >
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/admin/about"
                        className="flex py-2 px-3 rounded-md hover:bg-accent font-medium"
                      >
                        About
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/admin/help"
                        className="flex py-2 px-3 rounded-md hover:bg-accent font-medium"
                      >
                        Help
                      </Link>
                    </SheetClose>
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
      
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Travel Tales Travel Blog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}