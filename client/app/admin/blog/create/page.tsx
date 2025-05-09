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

interface Country {
  value: string;
  label: string;
}

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const editorRef = useRef<RichTextEditorRef>(null);

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
          .map((country: any) => ({
            value: country.id,
            label: country.common_name
          }))
          .sort((a: Country, b: Country) => a.label.localeCompare(b.label));
        
        setCountries(formattedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountryError('Failed to load countries. Using fallback list.');

        //Fallback
        setCountries([
          { value: 'fr', label: 'France' },
          { value: 'it', label: 'Italy' },
          { value: 'jp', label: 'Japan' },
          { value: 'th', label: 'Thailand' },
          { value: 'us', label: 'United States' },
          { value: 'au', label: 'Australia' },
          { value: 'in', label: 'India' },
          { value: 'br', label: 'Brazil' },
          { value: 'za', label: 'South Africa' },
          { value: 'ca', label: 'Canada' },
          { value: 'other', label: 'Other' },
        ]);
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
    const isEmpty = editorRef.current?.isEmpty() || true;

    if (!editorContent || isEmpty) {
      toast.error("Please write some content for your blog post");
      return;
    }

    setSaving(true);

    // Get the country label for saving
    const selectedCountry = countries.find(c => c.value === country)?.label || '';

    // Prepare the blog post data
    const blogPost = {
      title,
      country: country,
      countryName: selectedCountry,
      content: editorContent,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPost),
      });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save blog post');
      // }

      // Success message
      toast.success("Blog post saved successfully!");
      
      // Optional: Clear form or redirect to the published post
      // router.push('/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error("Failed to save blog post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
          {saving ? 'Saving...' : 'Save Blog Post'}
          <Save className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CreateBlog;