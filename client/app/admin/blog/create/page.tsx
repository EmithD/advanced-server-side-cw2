'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor, { RichTextEditorRef } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CountryDropdown from '@/components/CountriesDropDown';
import { useAuth } from '@/context/AuthContext';

type CountryInfo = {
  [key: string]: any;
};

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [countryName, setCountryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const editorRef = useRef<RichTextEditorRef>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);

      if (!isLoading && !isAuthenticated) {
        toast.error("Please log in to create a blog post");
        router.push('/auth/login');
      }
      
      setCheckingAuth(false);
    };

    checkAuth();
  }, [isAuthenticated, isLoading, router]);

  const handleCountrySelect = (countryCode: string, _countryData?: CountryInfo, selectedCountryName?: string) => {
    setCountry(countryCode);
    setCountryName(selectedCountryName || '');
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to create a blog post");
      router.push('/auth/login');
      return;
    }

    if (!title) {
      toast.error("Please enter a title for your blog post");
      return;
    }

    if (!country) {
      toast.error("Please select a country for your blog post");
      return;
    }

    const editorContent = editorRef.current?.getHTML() || '';
    
    const isContentEmpty = 
      !editorContent || 
      editorContent === '<p></p>' || 
      editorContent.replace(/<[^>]*>/g, '').trim() === '';
    
    if (isContentEmpty) {
      toast.error("Please write some content for your blog post");
      return;
    }

    setSaving(true);

    const blogPost = {
      title,
      country_code: country,
      country_name: countryName,
      content: editorContent,
    };

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPost),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Your session has expired. Please log in again.");
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to save blog post');
      }

      toast.success("Blog post saved successfully!");
      router.push('/admin');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error("Failed to save blog post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-20 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Travel Blog Post</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
        <div className="md:col-span-3">
          <Label htmlFor="title" className="text-lg mb-2 block">Blog Title</Label>
          <Input
            id="title"
            placeholder="Enter an engaging title for your travel story"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
        </div>
        
        <div>
          <CountryDropdown
            onCountrySelect={handleCountrySelect}
            selectedCountryCode={country}
            label="Country"
            placeholder="Select a country"
            fetchDetails={false}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <RichTextEditor 
          ref={editorRef}
          initialContent=""
          placeholder="Start writing your amazing travel story..."
          minHeight="400px"
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            const confirmed = window.confirm('Are you sure you want to discard this post?');
            if (confirmed) {
              setTitle('');
              setCountry('');
              editorRef.current?.clearContent();
            }
          }}
          size="lg"
        >
          Discard
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
              Saving...
            </>
          ) : (
            <>
              Save Blog Post
              <Save className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateBlog;