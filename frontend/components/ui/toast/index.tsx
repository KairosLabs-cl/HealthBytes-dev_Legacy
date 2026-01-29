'use client';
import React from 'react';
import { createToast, createToastHook } from '@gluestack-ui/toast';
import { Text, View, Platform, Pressable } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/nativewind-utils/withStyleContext';
import { cssInterop } from 'nativewind';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';

// Dummy animation components since @gluestack-ui/overlay exports were missing
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const Motion = { Component: View };

export const useToast = createToastHook(Motion.Component, AnimatePresence);

const SCOPE = 'TOAST';

const Root = withStyleContext(View, SCOPE);

const UIToast = createToast({
  Root: Root,
  Title: Text,
  Description: Text,
});

const toastStyle = tva({
  base: 'flex-row items-center p-4 gap-3 bg-background-0 shadow-soft-1 rounded-md border-outline-100 border-none sm:shadow-hard-5 sm:border bg-white shadow-xl elevation-5',
  variants: {
    action: {
      success: 'border-l-4 border-l-success-500 bg-success-50',
      error: 'border-l-4 border-l-error-500 bg-error-50',
      warning: 'border-l-4 border-l-warning-500 bg-warning-50',
      info: 'border-l-4 border-l-info-500 bg-info-50',
      attention: 'border-l-4 border-l-background-500 bg-background-50',
    },
    variant: {
      solid: '',
      outline: 'border border-outline-200',
      accent: 'border-l-4',
    },
  },
});

const toastTitleStyle = tva({
  base: 'text-typography-900 font-bold text-base',
  parentVariants: {
    action: {
      success: 'text-success-700',
      error: 'text-error-700',
      warning: 'text-warning-700',
      info: 'text-info-700',
      attention: 'text-typography-900',
    },
  },
});

const toastDescriptionStyle = tva({
  base: 'text-typography-700 text-sm',
  parentVariants: {
    action: {
      success: 'text-success-700',
      error: 'text-error-600',
      warning: 'text-warning-700',
      info: 'text-info-700',
      attention: 'text-typography-700',
    },
  },
});

const Toast = React.forwardRef<
  React.ComponentRef<typeof UIToast>,
  React.ComponentProps<typeof UIToast> & VariantProps<typeof toastStyle> & { className?: string }
>(function Toast(
  {
    className,
    action = 'attention',
    variant = 'solid',
    ...props
  },
  ref
) {
  return (
    <UIToast
      ref={ref}
      {...props}
      className={toastStyle({ variant, action, class: className })}
      context={{ action, variant }}
    />
  );
});

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof UIToast.Title>,
  React.ComponentProps<typeof UIToast.Title> & { className?: string }
>(function ToastTitle(
  {
    className,
    ...props
  },
  ref
) {
  const { action } = useStyleContext(SCOPE);
  return (
    <UIToast.Title
      ref={ref}
      {...props}
      className={toastTitleStyle({
        parentVariants: { action },
        class: className,
      })}
    />
  );
});

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof UIToast.Description>,
  React.ComponentProps<typeof UIToast.Description> & { className?: string }
>(function ToastDescription(
  {
    className,
    ...props
  },
  ref
) {
  const { action } = useStyleContext(SCOPE);
  return (
    <UIToast.Description
      ref={ref}
      {...props}
      className={toastDescriptionStyle({
        parentVariants: { action },
        class: className,
      })}
    />
  );
});

Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';

export { Toast, ToastTitle, ToastDescription };
