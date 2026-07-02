"use client"

import { useState } from "react"
import { User, AlertCircle, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import {
  Alert, AlertTitle, AlertDescription, type AlertVariant,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogBody,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { toast as sonnerToast } from "sonner"
import { useToast } from "@/hooks/use-toast"

const COLORS: AlertVariant[] = ["primary", "secondary", "success", "danger", "warning", "info", "dark"]

const ICONS = {
  primary:   <User />,
  secondary: <AlertCircle />,
  success:   <CheckCircle />,
  danger:    <XCircle />,
  warning:   <AlertTriangle />,
  info:      <Info />,
  dark:      <AlertCircle />,
}

const BODY_TEXT = "Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder."

function AlertClosableDemo() {
  const [dismissed, setDismissed] = useState<Set<AlertVariant>>(new Set())
  const toggle = (v: AlertVariant) =>
    setDismissed((prev) => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      return next
    })

  return (
    <div className="flex flex-col gap-2">
      {COLORS.map((variant) =>
        dismissed.has(variant) ? null : (
          <Alert key={variant} variant={variant} onClose={() => toggle(variant)}>
            This is a <strong>{variant}</strong> alert — check it out!
          </Alert>
        )
      )}
      {dismissed.size > 0 && (
        <Button
          variant="link" size="sm" type="button"
          className="h-auto p-0 text-xs text-muted-foreground self-start"
          onClick={() => setDismissed(new Set())}
        >
          Reset
        </Button>
      )}
    </div>
  )
}

function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h6>Variants</h6>
        <div className="flex flex-wrap gap-2">
          {(["default", "primary", "success", "danger", "warning", "info"] as const).map(variant => (
            <Button
              key={variant}
              variant={variant === "default" ? "outline" : variant === "primary" ? "default" : variant === "danger" ? "destructive" : variant}
              size="sm"
              onClick={() =>
                toast({
                  variant,
                  title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
                  description: "This is a notification message.",
                })
              }
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h6>With Action</h6>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            toast({
              variant: "primary",
              title: "File uploaded successfully",
              description: "document.pdf has been uploaded.",
              action: {
                label: "Undo",
                onClick: () => console.log("Undo clicked"),
              },
            })
          }
        >
          Show with Action
        </Button>
      </div>
    </div>
  )
}

function SonnerDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h6>Types</h6>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => sonnerToast("Default notification")}>Default</Button>
          <Button variant="success" size="sm" onClick={() => sonnerToast.success("Operation successful!")}>Success</Button>
          <Button variant="info" size="sm" onClick={() => sonnerToast.info("Here is some info.")}>Info</Button>
          <Button variant="warning" size="sm" onClick={() => sonnerToast.warning("This is a warning.")}>Warning</Button>
          <Button variant="destructive" size="sm" onClick={() => sonnerToast.error("Something went wrong.")}>Error</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h6>With Description</h6>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            sonnerToast.success("Changes saved", {
              description: "Your changes have been saved successfully.",
            })
          }
        >
          Show with Description
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h6>Loading</h6>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            sonnerToast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
              loading: "Saving changes...",
              success: "Changes saved!",
              error: "Failed to save.",
            })
          }
        >
          Show Loading Promise
        </Button>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-16">
      <SonnerToaster />
      <h1>Feedback</h1>

      {/* ── ALERT ── */}
      <section className="flex flex-col gap-10">
        <h4>Alert</h4>

        <div className="flex flex-col gap-3">
          <h6>Simple</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant}>
                This is a <strong>{variant}</strong> alert — check it out!
              </Alert>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Icon</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant} icon={ICONS[variant]}>
                This is a <strong>{variant}</strong> alert — check it out!
              </Alert>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Closable</h6>
          <AlertClosableDemo />
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Link</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant}>
                This is a {variant} alert with an{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>example link</a>. Give it a click if you like.
              </Alert>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Title + Body</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant}>
                <AlertTitle>This is a {variant} alert — check it out!</AlertTitle>
                <AlertDescription>{BODY_TEXT}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Icon + Title + Body</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant} icon={ICONS[variant]}>
                <AlertTitle>This is a {variant} alert — check it out!</AlertTitle>
                <AlertDescription>{BODY_TEXT}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOAST ── */}
      <section className="flex flex-col gap-10">
        <h4>Toast</h4>
        <ToastDemo />
      </section>

      {/* ── SONNER ── */}
      <section className="flex flex-col gap-10">
        <h4>Sonner</h4>
        <SonnerDemo />
      </section>

      {/* ── DIALOG ── */}
      <section className="flex flex-col gap-10">
        <h4>Dialog</h4>

        <div className="flex flex-col gap-3">
          <h6>Basic</h6>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="self-start">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Basic Dialog</DialogTitle>
                <DialogDescription>
                  This is a simple dialog. You can put any content here.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p className="text-[15px] text-[var(--text-body)]">
                  Dialogs are modal overlays that interrupt the user workflow to capture information or display critical messages.
                </p>
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Form</h6>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="self-start">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dialog-name">Name</Label>
                  <Input id="dialog-name" defaultValue="John Doe" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dialog-email">Email</Label>
                  <Input id="dialog-email" type="email" defaultValue="john@example.com" />
                </div>
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Destructive Action</h6>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="self-start">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  )
}
