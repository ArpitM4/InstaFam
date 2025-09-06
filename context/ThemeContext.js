"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeContext = createContext();

// Theme toggle button component
const ThemeToggleButton = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  >
    {theme === 'dark' ? (
      <FaSun className="text-white text-xl" />
    ) : (
      <FaMoon className="text-white text-xl" />
    )}
  </button>
);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Create a ThemeToggle component that uses the ThemeToggleButton
  const ThemeToggle = () => <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ThemeToggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};