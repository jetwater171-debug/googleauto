import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem('theme') as Theme;
        return stored || 'system';
    });

    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove previous theme classes
        root.classList.remove('light', 'dark');

        let resolvedTheme: 'light' | 'dark' = 'dark';

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            resolvedTheme = systemTheme;
            root.classList.add(systemTheme);
        } else {
            resolvedTheme = theme;
            root.classList.add(theme);
        }

        setEffectiveTheme(resolvedTheme);
    }, [theme]);

    useEffect(() => {
        // Listen for system theme changes when in system mode
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleChange = (e: MediaQueryListEvent) => {
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');
                const newTheme = e.matches ? 'dark' : 'light';
                root.classList.add(newTheme);
                setEffectiveTheme(newTheme);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('theme', newTheme);
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
