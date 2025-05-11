interface CountryInfo {
  name: {
    common: string;
    official: string;
  };
  flags: {
    svg: string;
    png: string;
    alt?: string;
  };
  capital: string[];
  currencies: {
    [code: string]: {
      name: string;
      symbol: string;
    };
  };
  languages: {
    [code: string]: string;
  };
  population: number;
  region: string;
  subregion?: string;
  timezones: string[];
  cca2: string;
  cca3: string;
}