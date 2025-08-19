import React, { createContext, useContext, useMemo, useState } from 'react';

export type Preferences = {
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  tickEvery10s: boolean;
  keepAwake: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ru';
};

const defaultPrefs: Preferences = {
  soundsEnabled: true,
  hapticsEnabled: true,
  tickEvery10s: false,
  keepAwake: true,
  theme: 'system',
  language: 'en',
};

const PreferencesContext = createContext<{
  prefs: Preferences;
  setPrefs: (p: Partial<Preferences>) => void;
}>({
  prefs: defaultPrefs,
  setPrefs: () => {},
});

export const PreferencesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [prefs, setPrefsState] = useState<Preferences>(defaultPrefs);

  const value = useMemo(
    () => ({
      prefs,
      setPrefs: (p: Partial<Preferences>) => setPrefsState(prev => ({ ...prev, ...p })),
    }),
    [prefs],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => useContext(PreferencesContext);
