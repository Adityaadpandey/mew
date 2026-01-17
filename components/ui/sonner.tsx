"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps, toast as sonnerToast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-500" />,
        info: <InfoIcon className="size-4 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-orange-500" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-zinc-900 group-[.toaster]:text-zinc-900 group-[.toaster]:dark:text-zinc-100 group-[.toaster]:border-zinc-200 group-[.toaster]:dark:border-zinc-800 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
          title: 'text-sm font-medium',
          description: 'text-sm text-zinc-500 dark:text-zinc-400',
          actionButton: 'bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          cancelButton: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          closeButton: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors',
          success: 'group-[.toaster]:border-emerald-200 group-[.toaster]:dark:border-emerald-900/50',
          error: 'group-[.toaster]:border-red-200 group-[.toaster]:dark:border-red-900/50',
          warning: 'group-[.toaster]:border-amber-200 group-[.toaster]:dark:border-amber-900/50',
          info: 'group-[.toaster]:border-blue-200 group-[.toaster]:dark:border-blue-900/50',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

// Custom toast helpers with brand styling
export const toast = {
  // Standard toasts
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) =>
    sonnerToast.success(message, options),

  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) =>
    sonnerToast.error(message, options),

  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) =>
    sonnerToast.warning(message, options),

  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) =>
    sonnerToast.info(message, options),

  loading: (message: string, options?: Parameters<typeof sonnerToast.loading>[1]) =>
    sonnerToast.loading(message, options),

  // Promise toast
  promise: sonnerToast.promise,

  // Dismiss
  dismiss: sonnerToast.dismiss,

  // Custom branded toast
  brand: (message: string, options?: Parameters<typeof sonnerToast>[1]) =>
    sonnerToast(message, {
      ...options,
      icon: <Sparkles className="size-4 text-orange-500" />,
      className: 'border-orange-200 dark:border-orange-900/50',
    }),

  // Action toast with callback
  action: (
    message: string,
    actionLabel: string,
    onAction: () => void,
    options?: Parameters<typeof sonnerToast>[1]
  ) =>
    sonnerToast(message, {
      ...options,
      action: {
        label: actionLabel,
        onClick: onAction,
      },
    }),

  // Undo toast
  undo: (
    message: string,
    onUndo: () => void,
    options?: Parameters<typeof sonnerToast>[1]
  ) =>
    sonnerToast(message, {
      ...options,
      action: {
        label: 'Undo',
        onClick: onUndo,
      },
      duration: 5000,
    }),
}

export { Toaster }
