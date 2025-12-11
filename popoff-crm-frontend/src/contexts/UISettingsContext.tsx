import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UISettingsContextValue {
  ambientEnabled: boolean;
  cursorTrailEnabled: boolean;
  toggleAmbient: () => void;
  toggleCursorTrail: () => void;
}

const ambientKey = 'ui:ambient-enabled';
const cursorKey = 'ui:cursor-trail-enabled';

const UISettingsContext = createContext<UISettingsContextValue | undefined>(undefined);

export const UISettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(ambientKey);
    return stored ? stored === 'true' : true;
  });
  const [cursorTrailEnabled, setCursorTrailEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(cursorKey);
    return stored ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem(ambientKey, ambientEnabled.toString());
  }, [ambientEnabled]);

  useEffect(() => {
    localStorage.setItem(cursorKey, cursorTrailEnabled.toString());
  }, [cursorTrailEnabled]);

  const value = useMemo(
    () => ({
      ambientEnabled,
      cursorTrailEnabled,
      toggleAmbient: () => setAmbientEnabled((prev) => !prev),
      toggleCursorTrail: () => setCursorTrailEnabled((prev) => !prev),
    }),
    [ambientEnabled, cursorTrailEnabled],
  );

  return <UISettingsContext.Provider value={value}>{children}</UISettingsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUISettings = () => {
  const ctx = useContext(UISettingsContext);
  if (!ctx) throw new Error('useUISettings must be used within UISettingsProvider');
  return ctx;
};
