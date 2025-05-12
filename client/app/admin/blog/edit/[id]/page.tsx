'use client';

import React, { useState, useRef, useEffect } from 'react';
import RichTextEditor, { RichTextEditorRef } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useParams, useRouter } from 'next/navigation';

interface Country {
  value: string;
  label: string;
}

const EditBlog = () => {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id;
  
  const [originalData, setOriginalData] = useState<{
    title: string;
    country_code: string;
    country_name: string;
    content: string;
  } | null>(null);
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const editorRef = useRef<RichTextEditorRef>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!blogId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/blogs/${blogId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog post: ${response.status}`);
        }
        
        const data = await response.json();
        const blogData = data.data;

        setOriginalData({
          title: blogData.title,
          country_code: blogData.country_code,
          country_name: blogData.country_name,
          content: blogData.content,
        });

        setTitle(blogData.title);
        setCountry(blogData.country_code);
        setBlogContent(blogData.content);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        toast.error('Failed to load blog data for editing');
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [blogId, router]);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      setCountryError(null);
      
      try {
        const response = await fetch('/api/countries');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`);
        }
        
        const data = await response.json();

        const formattedCountries: Country[] = data.data
          .map((country: { id: string; common_name: string; official_name: string }) => ({
            value: country.id,
            label: country.common_name
          }))
          .sort((a: Country, b: Country) => a.label.localeCompare(b.label));
        
        setCountries(formattedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountryError('Failed to load countries. Using fallback list.');

      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const filteredCountries = searchQuery === '' 
    ? countries 
    : countries.filter((country) =>
        country.label.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSave = async () => {
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

    const selectedCountry = countries.find((c) => c.value === country);

    const updatedFields: { title?: string; country_code?: string; country_name?: string; content?: string } = {};

    if (!originalData) {
      toast.error("Original blog data is missing");
      setSaving(false);
      return;
    }

    if (title !== originalData.title) {
      updatedFields.title = title;
    }

    if (country !== originalData.country_code) {
      updatedFields.country_code = country;
      updatedFields.country_name = selectedCountry?.label;
    }

    if (editorContent !== originalData.content) {
      updatedFields.content = editorContent;
    }

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      setSaving(false);
      return;
    }

    try {

      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }

      toast.success("Blog post updated successfully!");
      router.push(`/admin/blog/read/${blogId}`);
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error("Failed to update blog post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading blog post...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Travel Blog Post</h1>
      
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
          <Label htmlFor="country" className="text-lg mb-2 block">Country</Label>
          {countryError && (
            <p className="text-xs text-red-500 mb-1">{countryError}</p>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-10"
                id="country"
                disabled={loadingCountries}
              >
                {loadingCountries ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : country ? (
                  countries.find((item) => item.value === country)?.label || "Select a country"
                ) : (
                  "Select a country"
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search country..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {loadingCountries ? (
                    <div className="py-6 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin opacity-70" />
                      <p className="text-sm text-muted-foreground pt-2">Loading countries...</p>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {filteredCountries.map((item) => (
                          <CommandItem
                            key={item.value}
                            onSelect={() => {
                              setCountry(item.value === country ? "" : item.value);
                              setSearchQuery('');
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                country === item.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="mb-8">
        <RichTextEditor 
          ref={editorRef}
          initialContent={blogContent}
          placeholder="Start writing your amazing travel story..."
          minHeight="400px"
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            const confirmed = window.confirm('Are you sure you want to cancel editing? Your changes will be lost.');
            if (confirmed) {
              router.push(`/admin/blog/read/${blogId}`);
            }
          }}
          size="lg"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          {saving ? 'Saving...' : 'Update Blog Post'}
          <Save className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default EditBlog;