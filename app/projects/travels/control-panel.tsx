import * as React from 'react';
import { useState, useEffect } from 'react';
import './styles.css';

function ControlPanel(props: {
  onSelectCountry: (arg0: {
    country: string;
    continent: string;
    description: string;
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
}) {
  const [countries, setCountries] = useState<any[]>([]);

  // Fetch the countries data from /data/countries.json dynamically
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/data/countries.json');
        const data = await response.json();
        setCountries(data); // Set the fetched data into the state
      } catch (error) {
        console.error('Error fetching countries data:', error);
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="control-panel">
      <h1
        style={{
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginBottom: '10px',
        }}
      >
        Visited countries
      </h1>
      <hr />

      {countries.map((content, index) => (
        <div
          key={`btn-${index}`}
          className="country-item"
          onClick={() => props.onSelectCountry(content)}
        >
          {content.country}
        </div>
      ))}
    </div>
  );
}

export default React.memo(ControlPanel);
