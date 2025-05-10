'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
}

export interface RichTextEditorRef {
  getHTML: () => string;
  getContent: () => string;
  isEmpty: () => boolean;
  clearContent: () => void;
  setHTML: (content: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ 
    initialContent = '<p></p>', 
    placeholder = 'Start writing...', 
    onChange, 
    minHeight = '300px' 
  }, ref) => {
    const [preview, setPreview] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [contentLoaded, setContentLoaded] = useState(false);
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
          allowBase64: true, // Important to allow base64 images
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
          placeholder,
        }),
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class: `prose prose-lg focus:outline-none max-w-none min-h-[${minHeight}] p-4`,
        },
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
      // Fix for SSR hydration issues in Next.js
      editable: true,
      autofocus: false,
      enableInputRules: true,
      enablePasteRules: true,
      injectCSS: false,
      // Explicitly set to false for SSR
      immediatelyRender: false,
    });

    // Set content when editor is ready and content has changed
    useEffect(() => {
      if (editor && initialContent !== '<p></p>' && !contentLoaded) {
        // Using a timeout to ensure the editor is fully initialized
        setTimeout(() => {
          editor.commands.setContent(initialContent);
          setContentLoaded(true);
        }, 100);
      }
    }, [editor, initialContent, contentLoaded]);

    // Reset contentLoaded flag when initialContent changes
    useEffect(() => {
      setContentLoaded(false);
    }, [initialContent]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || '',
      getContent: () => editor?.getHTML() || '',
      isEmpty: () => editor?.isEmpty || true,
      clearContent: () => editor?.commands.clearContent(true),
      setHTML: (content: string) => {
        if (editor) {
          editor.commands.setContent(content);
        }
      }
    }));

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
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
      if (!editor) return;
      
      if (linkUrl) {
        // Ensure URL has proper protocol
        let formattedUrl = linkUrl;
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = 'https://' + formattedUrl;
        }
        
        if (linkText) {
          // If we have text, delete selection and insert link with text
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .deleteSelection()
            .insertContent(`<a href="${formattedUrl}" target="_blank">${linkText}</a>`)
            .run();
        } else {
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
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
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
      <>
        <Card>
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
      </>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;