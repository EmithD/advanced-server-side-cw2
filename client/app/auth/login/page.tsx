"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, Loader2, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please check your credentials.');
    }
  };

  const handleBrowseWithoutLogin = () => {
    router.push('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleBrowseWithoutLogin}
          >
            <Globe className="h-4 w-4" />
            Browse without login
          </Button>
        </CardContent>
        
        <CardFooter className="flex flex-wrap items-center justify-center gap-1">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?
          </div>
          <Link
            href="/auth/register"
            className="text-sm text-primary hover:underline"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;