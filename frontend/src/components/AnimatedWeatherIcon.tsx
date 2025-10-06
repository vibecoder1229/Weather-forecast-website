import React, { useState, useEffect, useRef } from 'react';
import { getWeatherIcon, supportsAnimation } from '../utils/weatherIconMapper';

interface AnimatedWeatherIconProps {
  /** WeatherAPI condition code */
  code: number;
  /** Day (1) or night (0) */
  isDay: number;
  /** Alt text for accessibility */
  alt: string;
  /** Custom CSS classes */
  className?: string;
  /** Icon size - will set both width and height */
  size?: number | string;
  /** Enable or disable animation */
  enableAnimation?: boolean;
  /** Icon variation (fill or line) */
  variation?: 'fill' | 'line';
  /** Loading placeholder */
  loadingPlaceholder?: React.ReactNode;
  /** Error fallback */
  errorFallback?: React.ReactNode;
  /** Callback when icon loads */
  onLoad?: () => void;
  /** Callback when icon fails to load */
  onError?: () => void;
}

/**
 * AnimatedWeatherIcon - A React component for displaying weather icons with animation support
 * 
 * Features:
 * - Automatic fallback to static icons if animation fails
 * - Loading states and error handling
 * - Accessibility support
 * - Responsive sizing
 * - Performance optimized with preloading
 */
export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  code,
  isDay,
  alt,
  className = '',
  size = '100%',
  enableAnimation = true,
  variation = 'fill',
  loadingPlaceholder,
  errorFallback,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iconSrc, setIconSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Get the appropriate icon path
  useEffect(() => {
    const shouldAnimate = enableAnimation && supportsAnimation(code);
    const src = getWeatherIcon(code, isDay, variation, shouldAnimate);
    setIconSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [code, isDay, enableAnimation, variation]);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error with fallback mechanism
  const handleError = () => {
    if (!hasError) {
      // Try fallback to static icon if animated icon failed
      if (enableAnimation && supportsAnimation(code)) {
        console.warn(`Animated icon failed for code ${code}, falling back to static icon`);
        const fallbackSrc = getWeatherIcon(code, isDay, variation, false);
        setIconSrc(fallbackSrc);
        setHasError(false); // Give fallback a chance
        return;
      }
    }
    
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // CSS for icon sizing
  const sizeStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  };

  // Show loading state
  if (isLoading && loadingPlaceholder) {
    return <div className={className} style={sizeStyle}>{loadingPlaceholder}</div>;
  }

  // Show error state
  if (hasError && errorFallback) {
    return <div className={className} style={sizeStyle}>{errorFallback}</div>;
  }

  // Default error fallback
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded ${className}`}
        style={sizeStyle}
        role="img" 
        aria-label={alt}
      >
        <span className="text-muted-foreground text-xs">⛅</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={iconSrc}
      alt={alt}
      className={`object-contain ${className}`}
      style={sizeStyle}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      draggable={false}
    />
  );
};

/**
 * WeatherIconWithHover - Enhanced weather icon with hover effects and transitions
 */
interface WeatherIconWithHoverProps extends AnimatedWeatherIconProps {
  /** Hover scale factor */
  hoverScale?: number;
  /** Transition duration in milliseconds */
  transitionDuration?: number;
  /** Enable pulse animation on load */
  pulseOnLoad?: boolean;
}

export const WeatherIconWithHover: React.FC<WeatherIconWithHoverProps> = ({
  hoverScale = 1.1,
  transitionDuration = 300,
  pulseOnLoad = false,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Handle pulse animation on load
  useEffect(() => {
    if (pulseOnLoad && !props.onLoad) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [pulseOnLoad, props.onLoad]);

  const enhancedClassName = `
    transition-all duration-${transitionDuration} ease-in-out cursor-pointer
    ${isHovered ? `scale-${Math.round(hoverScale * 100)}` : 'scale-100'}
    ${showPulse ? 'animate-pulse' : ''}
    ${className}
  `.trim();

  return (
    <AnimatedWeatherIcon
      {...props}
      className={enhancedClassName}
      onLoad={() => {
        if (pulseOnLoad) {
          setShowPulse(true);
          setTimeout(() => setShowPulse(false), 1000);
        }
        props.onLoad?.();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

/**
 * Default loading spinner for weather icons
 */
export const WeatherIconLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${className}`} />
);

/**
 * Default error fallback for weather icons
 */
export const WeatherIconError: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
    <span className="text-2xl">⛅</span>
  </div>
);

export default AnimatedWeatherIcon;