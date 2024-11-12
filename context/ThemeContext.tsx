'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default theme is 'light', it will be updated in useEffect
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // This effect will run only on the client-side after the first render
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const preferredTheme =
      storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'light'; // fallback to 'light' if no valid theme is found
    setTheme(preferredTheme);
    document.documentElement.setAttribute('data-theme', preferredTheme);
  }, []); // Empty dependency array ensures this runs once after initial render

  // Toggle theme between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme); // Store the selected theme
      document.documentElement.setAttribute('data-theme', newTheme); // Update theme in DOM
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
