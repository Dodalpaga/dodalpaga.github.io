// app/projects/travels/control-panel.tsx
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import './styles.css';

interface Country {
  country: string;
  continent: string;
  description: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

interface ControlPanelProps {
  onSelectCountry: (country: Country) => void;
}

function ControlPanel({ onSelectCountry }: ControlPanelProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [activeContinent, setActiveContinent] = useState<string>('All');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/data/countries.json');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries data:', error);
      }
    };
    fetchCountries();
  }, []);

  // Derive unique continents
  const continents = useMemo(() => {
    const set = new Set(countries.map((c) => c.continent).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [countries]);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchSearch = c.country
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchContinent =
        activeContinent === 'All' || c.continent === activeContinent;
      return matchSearch && matchContinent;
    });
  }, [countries, search, activeContinent]);

  return (
    <div className="cp-root">
      {/* Panel title */}
      <div className="cp-header">
        <span className="cp-header__label">VISITED COUNTRIES</span>
        <span className="cp-header__count">{countries.length}</span>
      </div>

      {/* Search */}
      <div className="cp-search-wrap">
        <span className="cp-search-icon">⌕</span>
        <input
          className="cp-search"
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search countries"
        />
        {search && (
          <button
            className="cp-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Continent filter chips */}
      {continents.length > 1 && (
        <div className="cp-chips">
          {continents.map((c) => (
            <button
              key={c}
              className={`cp-chip${activeContinent === c ? ' cp-chip--active' : ''}`}
              onClick={() => setActiveContinent(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <hr className="cp-divider" />

      {/* Country list */}
      <div className="cp-list">
        {filtered.length === 0 ? (
          <div className="cp-empty">No results</div>
        ) : (
          filtered.map((country, i) => (
            <button
              key={`${country.country}-${i}`}
              className="cp-item"
              onClick={() => onSelectCountry(country)}
            >
              <span className="cp-item__name">{country.country}</span>
              {country.continent && (
                <span className="cp-item__continent">{country.continent}</span>
              )}
              <span className="cp-item__arrow">→</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default React.memo(ControlPanel);
