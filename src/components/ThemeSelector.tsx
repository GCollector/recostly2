import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

interface Theme {
  name: string;
  className: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  description: string;
}

const themes: Theme[] = [
  {
    name: 'Default',
    className: '',
    colors: {
      primary: '#3b82f6',
      secondary: '#a855f7',
      accent: '#10b981'
    },
    description: 'Modern blue with purple accents'
  },
  {
    name: 'Ocean',
    className: 'theme-ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#10b981'
    },
    description: 'Cool ocean blues and teals'
  },
  {
    name: 'Sunset',
    className: 'theme-sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#eab308'
    },
    description: 'Warm oranges and pinks'
  },
  {
    name: 'Forest',
    className: 'theme-forest',
    colors: {
      primary: '#059669',
      secondary: '#84cc16',
      accent: '#0d9488'
    },
    description: 'Natural greens and earth tones'
  },
  {
    name: 'Royal',
    className: 'theme-royal',
    colors: {
      primary: '#7c3aed',
      secondary: '#c026d3',
      accent: '#dc2626'
    },
    description: 'Rich purples and magentas'
  }
];

const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');

  const handleThemeChange = (theme: Theme) => {
    // Remove existing theme classes
    themes.forEach(t => {
      if (t.className) {
        document.documentElement.classList.remove(t.className);
      }
    });

    // Add new theme class
    if (theme.className) {
      document.documentElement.classList.add(theme.className);
    }

    setCurrentTheme(theme.className);
    setIsOpen(false);

    // Store theme preference
    localStorage.setItem('theme-preference', theme.className);
  };

  // Load saved theme on component mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      const theme = themes.find(t => t.className === savedTheme);
      if (theme) {
        handleThemeChange(theme);
      }
    }
  }, []);

  const currentThemeData = themes.find(t => t.className === currentTheme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost flex items-center space-x-2 p-2"
        title="Change Theme"
      >
        <Palette className="h-5 w-5" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-modal-backdrop" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme Selector Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl z-modal p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Choose Theme</h3>
            
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    currentTheme === theme.className
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white/50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Color Preview */}
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/50"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/50"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/50"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                      
                      <div className="text-left">
                        <div className="font-semibold text-neutral-900">{theme.name}</div>
                        <div className="text-sm text-neutral-600">{theme.description}</div>
                      </div>
                    </div>
                    
                    {currentTheme === theme.className && (
                      <Check className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-primary-subtle rounded-lg">
              <h4 className="font-medium text-primary-900 mb-2">Current Theme</h4>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: currentThemeData.colors.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: currentThemeData.colors.secondary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: currentThemeData.colors.accent }}
                  />
                </div>
                <span className="text-sm font-medium text-primary-800">
                  {currentThemeData.name}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;