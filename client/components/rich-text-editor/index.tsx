'use client';

import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const BlogEditor = () => {
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'mx-auto my-4 max-w-full rounded-lg shadow-md',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing travel story...',
      }),
    ],
    content: '<p>Write about your travel experience here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // This will update the editor content in real-time as you type
    },
  });

  const countries = [
    { value: 'france', label: 'France' },
    { value: 'italy', label: 'Italy' },
    { value: 'japan', label: 'Japan' },
    { value: 'thailand', label: 'Thailand' },
    { value: 'usa', label: 'United States' },
    { value: 'australia', label: 'Australia' },
    { value: 'india', label: 'India' },
    { value: 'brazil', label: 'Brazil' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'canada', label: 'Canada' },
    { value: 'other', label: 'Other' },
  ];

  const handleSave = async () => {
    if (!title) {
      toast.error("Please enter a title for your blog post");
      return;
    }

    if (!country) {
      toast.error("Please select a country for your blog post");
      return;
    }

    if (!editor?.getHTML() || editor?.isEmpty) {
      toast.error("Please write some content for your blog post");
      return;
    }

    setSaving(true);

    // Prepare the blog post data
    const blogPost = {
      title,
      country,
      content: editor?.getHTML(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Example API call - replace with your actual API endpoint
      // const response = await fetch('/api/blog-posts', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(blogPost),
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result && editor) {
          // Insert the image with proper attributes
          editor
            .chain()
            .focus()
            .setImage({ 
              src: e.target.result.toString(),
              alt: file.name 
            })
            .run();
            
          // Create a new paragraph after the image to continue typing
          setTimeout(() => {
            editor?.chain().focus().createParagraphNear().run();
          }, 10);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = (): void => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      // Ensure URL has proper protocol
      let formattedUrl = linkUrl;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      
      if (linkText && editor) {
        // If we have text, delete selection and insert link with text
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .deleteSelection()
          .insertContent(`<a href="${formattedUrl}" target="_blank">${linkText}</a>`)
          .run();
      } else if (editor) {
        // Otherwise just set link on current selection
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: formattedUrl, target: '_blank' })
          .run();
      }
    } else {
      // Remove link if URL is empty
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    
    // Close dialog and reset fields
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  if (!editor) {
    return <div>Loading editor...</div>;
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
          <Label htmlFor="country" className="text-lg mb-2 block">Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="border-b flex flex-wrap items-center p-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-accent' : ''}
              aria-label="Bold"
            >
              <Bold className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-accent' : ''}
              aria-label="Italic"
            >
              <Italic className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-accent' : ''}
              aria-label="Bullet List"
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-accent' : ''}
              aria-label="Ordered List"
            >
              <ListOrdered className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={triggerImageUpload}
              aria-label="Insert Image"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLinkDialogOpen(true)}
              className={editor.isActive('link') ? 'bg-accent' : ''}
              aria-label="Insert Link"
            >
              <LinkIcon className="w-5 h-5" />
            </Button>
            <div className="ml-auto flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
                className="mr-2"
              >
                {preview ? 'Edit' : 'Preview'}
              </Button>
            </div>
          </div>

          {preview ? (
            <div 
              className="prose max-w-none p-6"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          ) : (
            <EditorContent editor={editor} className="min-h-[400px]" />
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            const confirmed = window.confirm('Are you sure you want to discard this post?');
            if (confirmed) {
              setTitle('');
              setCountry('');
              editor.commands.clearContent(true);
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

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="text">Link Text (optional)</Label>
              <Input
                id="text"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit}>
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogEditor;