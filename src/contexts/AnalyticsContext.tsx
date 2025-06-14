import { createContext, useContext, type ReactNode } from 'react';
import { logEvent, logPageView, Events } from '../utils/analytics';

interface AnalyticsContextType {
  trackEvent: (action: string, params?: Record<string, any>) => void;
  trackPageView: (path: string, title: string) => void;
  events: typeof Events;
}

const defaultContext: AnalyticsContextType = {
  trackEvent: () => {},
  trackPageView: () => {},
  events: Events,
};

export const AnalyticsContext = createContext<AnalyticsContextType>(defaultContext);

export const useAnalytics = (): AnalyticsContextType => {
  return useContext(AnalyticsContext);
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const trackEvent = (action: string, params: Record<string, any> = {}) => {
    logEvent(action, params);
  };

  const trackPageView = (path: string, title: string) => {
    logPageView(path, title);
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView, events: Events }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
