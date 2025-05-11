'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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
import { cn } from "@/lib/utils";
import Fuse from 'fuse.js';

interface Country {
  value: string;
  label: string;
}

interface CountryDropdownProps {
  onCountrySelect: (countryCode: string, countryData?: any, countryName?: string) => void;
  selectedCountryCode?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  fetchDetails?: boolean;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  onCountrySelect,
  selectedCountryCode = '',
  label = 'Select a country',
  placeholder = 'Select a country',
  className = '',
  fetchDetails = false
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryCode, setCountryCode] = useState(selectedCountryCode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    setCountryCode(selectedCountryCode);
  }, [selectedCountryCode]);

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/countries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
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
      setError('Failed to load countries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fuse = new Fuse(countries, {
    keys: ['label'],
    threshold: 0.7,
  });

  const filteredCountries = searchQuery === ''
    ? countries
    : fuse.search(searchQuery).map(result => result.item);

  const fetchCountryDetails = useCallback(async (code: string) => {
    try {
      const response = await fetch(`/api/countries/${code}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchType: 'alpha',
          searchQuery: code
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch country details: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0];
      } else {
        toast.error('Country information not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching country details:', error);
      toast.error('Failed to load country information. Please try again later.');
      return null;
    }
  }, []);

  const handleCountrySelect = async (value: string) => {
    const newValue = value === countryCode ? "" : value;
    setCountryCode(newValue);
    setSearchQuery('');
    setOpen(false);
    
    if (newValue) {
      const countryName = countries.find(c => c.value === newValue)?.label || '';
      
      if (fetchDetails) {
        const countryData = await fetchCountryDetails(newValue);
        onCountrySelect(newValue, countryData, countryName);
      } else {
        onCountrySelect(newValue, undefined, countryName);
      }
    } else {
      onCountrySelect("", undefined, "");
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="country" className="text-lg mb-2 block">
          {label}
        </Label>
      )}
      {error && (
        <p className="text-xs text-red-500 mb-1">{error}</p>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
            id="country"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : countryCode ? (
              countries.find((item) => item.value === countryCode)?.label || placeholder
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className="country-dropdown">
            <CommandInput 
              placeholder="Search for a country..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="relative pr-6"
            />

              <CommandList className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-transparent">

                {loading ? (
                  <div className="py-6 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin opacity-70" />
                    <p className="text-sm text-muted-foreground pt-2">Loading countries...</p>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCountries.map((item) => (
                        <CommandItem
                          key={item.value}
                          onSelect={() => handleCountrySelect(item.value)}
                          className="flex items-center"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              countryCode === item.value ? "opacity-100" : "opacity-0"
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
  );
};

export default CountryDropdown;