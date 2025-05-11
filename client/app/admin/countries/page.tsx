'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CountryInfoCard from '@/components/CountryInfoCard';
import CountryDropdown from '@/components/CountriesDropDown';

const CountriesPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('');

  const handleCountrySelect = (code: string, countryData?: CountryInfo) => {
    setCountryCode(code);
    
    if (countryData) {
      setSelectedCountry(countryData);
      setLoading(false);
    } else if (code) {
      setLoading(true);
    } else {
      setSelectedCountry(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Globe className="mr-3 h-8 w-8 text-primary" />
        Explore Countries
      </h1>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Find a Country</CardTitle>
        </CardHeader>
        <CardContent>
          <CountryDropdown
            onCountrySelect={handleCountrySelect}
            selectedCountryCode={countryCode}
            label="Select a country to view details"
            fetchDetails={true}
          />
        </CardContent>
      </Card>
      
      <CountryInfoCard 
        country={selectedCountry} 
        loading={loading} 
      />
    </div>
  );
};

export default CountriesPage;