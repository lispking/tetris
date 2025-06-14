// Google Analytics Measurement ID - Replace with your actual Measurement ID
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-G6MYELEDLN';

export const initGA = (): void => {
  // Prevent duplicate initialization in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Analytics disabled in development mode');
    return;
  }

  // Create dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Set the current date
  window.gtag('js', new Date());
  
  // Configure with your Measurement ID
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_location: window.location.href,
    page_title: document.title,
  });

  // Add the Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

// Log page views
export const logPageView = (url: string, title: string): void => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
  }
};

// Log specific events
export const logEvent = (action: string, params: Record<string, any> = {}): void => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('Analytics event:', action, params);
  }
};

// Game-specific events
export const Events = {
  GAME_START: 'game_start',
  GAME_OVER: 'game_over',
  ROW_CLEAR: 'row_clear',
  SCORE_UPDATE: 'score_update',
  LEVEL_UP: 'level_up',
  PIECE_MOVE: 'piece_move',
  PIECE_ROTATE: 'piece_rotate',
  PAUSE: 'game_pause',
  RESUME: 'game_resume',
  NEW_GAME: 'new_game',
};
