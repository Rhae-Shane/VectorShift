import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  applyTheme,
  getStoredTheme,
  readThemeToken,
  toggleTheme as flipTheme,
  type Theme,
} from '../utils/theme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  canvasDot: string;
  edgeStroke: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const useThemeState = (): ThemeContextValue => {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [canvasDot, setCanvasDot] = useState(() =>
    readThemeToken('--vs-canvas-dot', '#b8bec7')
  );
  const [edgeStroke, setEdgeStroke] = useState(() =>
    readThemeToken('--vs-edge-color', '#9ca3af')
  );

  useEffect(() => {
    applyTheme(theme);
    setCanvasDot(readThemeToken('--vs-canvas-dot', '#b8bec7'));
    setEdgeStroke(readThemeToken('--vs-edge-color', '#9ca3af'));
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => flipTheme(current));
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    canvasDot,
    edgeStroke,
  };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const value = useThemeState();
  return createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
