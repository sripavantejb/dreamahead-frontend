// Analytics event tracking
type AnalyticsEvent = 
  | 'tile_opened'
  | 'tile_description_viewed'
  | 'test_started_anonymous'
  | 'auth_prompted_for_report'
  | 'flow_step'
  | 'fit_completed'
  | 'whatsapp_opt_in'
  | 'profile_completed'
  | 'test_started'
  | 'test_completed'
  | 'signup_created'
  | 'colleges_saved'
  | 'error_occurred';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

export const trackEvent = (event: AnalyticsEvent, data?: EventData) => {
  try {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${event}`, data);
    }
    
    // In production, this could send to analytics service
    // e.g., Google Analytics, Mixpanel, PostHog, etc.
    // For now, we'll use console as fallback
    if (window.gtag) {
      window.gtag('event', event, data);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
};

export const trackError = (error: Error, context?: EventData) => {
  try {
    console.error('[Error]', error, context);
    
    trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500),
      ...context
    });
  } catch (e) {
    console.error('[Analytics] Failed to track error:', e);
  }
};

// Convenience wrapper for analytics tracking
export const analytics = {
  track: trackEvent,
  error: trackError,
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
