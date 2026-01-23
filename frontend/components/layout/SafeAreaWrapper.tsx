import React from 'react';
import { ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps extends ViewProps {
  children: React.ReactNode;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  className?: string;
}

/**
 * SafeAreaWrapper Component
 * Wraps content with SafeAreaView to handle notches and system UI
 * 
 * @param edges - Specify which edges to apply safe area insets (default: all)
 * @param className - Tailwind classes for styling
 * 
 * Usage:
 * <SafeAreaWrapper edges={['top', 'bottom']}>
 *   <YourContent />
 * </SafeAreaWrapper>
 */
export function SafeAreaWrapper({ 
  children, 
  edges,
  className = '',
  ...props 
}: SafeAreaWrapperProps) {
  return (
    <SafeAreaView 
      edges={edges}
      className={className}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}

/**
 * SafeAreaScreen Component
 * Full screen wrapper with safe areas
 * Useful for main app screens
 */
export function SafeAreaScreen({ 
  children, 
  className = 'flex-1 bg-white',
  ...props 
}: SafeAreaWrapperProps) {
  return (
    <SafeAreaWrapper className={className} {...props}>
      {children}
    </SafeAreaWrapper>
  );
}
