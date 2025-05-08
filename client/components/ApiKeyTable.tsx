'use client';

import React from 'react';
import { Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ApiKey {
  id: string;
  api_key: string;
  user_id: string;
  created_at: string;
}

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  isLoading: boolean;
}

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({ 
  apiKeys, 
  onDelete, 
  onCopy,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && apiKeys.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">API Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">API Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <TableRow key={apiKey.id}>
              <TableCell className="font-mono">
                <div className="flex items-center space-x-2">
                  {apiKey.api_key}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onCopy(apiKey.api_key)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{formatDate(apiKey.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(apiKey.id)}
                >
                  <Trash2 size={18} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {apiKeys.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No API keys found. Create your first key to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApiKeyTable;