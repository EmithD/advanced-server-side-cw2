'use client';

import React from 'react';
import { 
  Globe, 
  Flag,
  Building2,
  Coins,
  Languages,
  MapPin,
  Clock,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface CountryInfoCardProps {
  country: CountryInfo | null;
  loading?: boolean;
  className?: string;
}

const CountryInfoCard: React.FC<CountryInfoCardProps> = ({ 
  country, 
  loading = false,
  className = ""
}) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <Card className={`bg-muted/30 ${className}`}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-4/5" />
            </div>
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!country) {
    return (
      <Card className={`bg-muted/10 border-dashed ${className}`}>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <Globe className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Country Selected</h3>
          <p className="text-muted-foreground max-w-md">
            Select a country to view detailed information about its geography, demographics, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-muted/30 ${className}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          About {country.name.common}
        </CardTitle>
        {country.name.official !== country.name.common && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            Official: {country.name.official}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            {country.flags?.svg && (
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-2 flex items-center">
                  <Flag className="h-4 w-4 mr-2 text-primary" />
                  Flag:
                </span>
                <div className="relative h-32 w-full overflow-hidden rounded-md border">
                  <Image 
                    src={country.flags.svg} 
                    alt={country.flags.alt || `Flag of ${country.name.common}`} 
                    fill 
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, 50vw" 
                  />
                </div>
                {country.flags.alt && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    {country.flags.alt}
                  </p>
                )}
              </div>
            )}
            
            {country.capital && country.capital.length > 0 && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium mr-2">Capital:</span>
                <span>{country.capital.join(', ')}</span>
              </div>
            )}
            
            {country.currencies && Object.keys(country.currencies).length > 0 && (
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium mr-2">Currency:</span>
                <span>
                  {Object.entries(country.currencies).map(([code, currency], index, array) => (
                    <span key={code}>
                      {currency.name}
                      {currency.symbol && ` (${currency.symbol})`}
                      {index < array.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-4">
            {country.languages && Object.keys(country.languages).length > 0 && (
              <div className="flex items-start">
                <Languages className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <div>
                  <span className="text-sm font-medium mr-2">Languages:</span>
                  <span>{Object.values(country.languages).join(', ')}</span>
                </div>
              </div>
            )}
            
            {country.population && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="text-sm font-medium mr-2">Population:</span>
                <span>{formatNumber(country.population)}</span>
              </div>
            )}
            
            {country.region && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium mr-2">Region:</span>
                <span>
                  {country.region}
                  {country.subregion && ` (${country.subregion})`}
                </span>
              </div>
            )}

            {country.timezones && country.timezones.length > 0 && (
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <div>
                  <span className="text-sm font-medium mr-2">Timezones:</span>
                  <span className="break-words">
                    {country.timezones.length > 5 
                      ? `${country.timezones.slice(0, 5).join(', ')} +${country.timezones.length - 5} more`
                      : country.timezones.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryInfoCard;