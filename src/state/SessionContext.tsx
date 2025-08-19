import React, { createContext, useContext, useMemo, useState } from 'react';

export type Difficulty = 'Light' | 'Easy' | 'Middle' | 'Stunt' | 'Hardcore' | 'Pro';

export type SessionSetup = {
  typeId: string | null;
  durationMin: 3 | 5 | 10 | number;
  difficulty: Difficulty;
};

export type SessionState = 'idle' | 'running' | 'paused' | 'completed';

const defaultSetup: SessionSetup = {
  typeId: null,
  durationMin: 5,
  difficulty: 'Middle',
};

const SessionContext = createContext<{
  setup: SessionSetup;
  setSetup: (u: Partial<SessionSetup>) => void;
  state: SessionState;
  setState: (s: SessionState) => void;
}>({ setup: defaultSetup, setSetup: () => {}, state: 'idle', setState: () => {} });

export const SessionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [setup, setSetupState] = useState<SessionSetup>(defaultSetup);
  const [state, setState] = useState<SessionState>('idle');

  const value = useMemo(
    () => ({
      setup,
      setSetup: (u: Partial<SessionSetup>) => setSetupState(prev => ({ ...prev, ...u })),
      state,
      setState,
    }),
    [setup, state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
