"use client"

import { useToast } from "@/hooks/use-toast"

import {
  Toast,
  ToastActions,
  ToastAction,
  ToastBody,
  ToastCancel,
  ToastClose,
  ToastDescription,
  ToastHeader,
  ToastIcon,
  ToastProvider,
  ToastStatusIcon,
  ToastTime,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, type, variant, title, description, timestamp, action, cancel, open, onOpenChange, duration }) => {
        if (type === "rich") {
          return (
            <Toast
              key={id}
              variant={variant}
              open={open}
              onOpenChange={onOpenChange}
              duration={duration ?? Infinity}
            >
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                <ToastStatusIcon variant={variant} />
                <div className="flex-1 min-w-0 pt-0.5">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && <ToastDescription>{description}</ToastDescription>}
                </div>
                <ToastClose />
              </div>
              {(action || cancel) && (
                <ToastActions>
                  {action && (
                    <ToastAction
                      altText={action.altText ?? action.label}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </ToastAction>
                  )}
                  {cancel && (
                    <ToastCancel onClick={cancel.onClick}>{cancel.label}</ToastCancel>
                  )}
                </ToastActions>
              )}
            </Toast>
          )
        }

        return (
          <Toast
            key={id}
            variant={variant}
            open={open}
            onOpenChange={onOpenChange}
            duration={duration ?? 5000}
          >
            <ToastHeader>
              <ToastIcon variant={variant} />
              {title && <ToastTitle>{title}</ToastTitle>}
              {timestamp && <ToastTime>{timestamp}</ToastTime>}
              <ToastClose />
            </ToastHeader>
            {description && <ToastBody>{description}</ToastBody>}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
