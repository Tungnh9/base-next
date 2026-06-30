"use client"

import { useState } from "react";
import {
  Star, Sun, Moon, Settings, Bell, Shield,
  Info, AlertTriangle, CheckCircle, XCircle, User, AlertCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  type AlertVariant,
} from "@/components/ui/alert";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

const BODY_TEXT =
  "Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder. Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.";

const COLORS: AlertVariant[] = [
  "primary", "secondary", "success", "danger", "warning", "info", "dark",
];

const ICONS = {
  primary:   <User />,
  secondary: <AlertCircle />,
  success:   <CheckCircle />,
  danger:    <XCircle />,
  warning:   <AlertTriangle />,
  info:      <Info />,
  dark:      <AlertCircle />,
};

const BADGE_VARIANTS: BadgeVariant[] = [
  "primary", "secondary", "success", "danger", "warning", "info", "dark",
]

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const COUNT_ICON_VARIANTS = [
  ["primary",   <Star />],
  ["secondary", <Settings />],
  ["success",   <CheckCircle />],
  ["danger",    <XCircle />],
  ["warning",   <AlertTriangle />],
  ["info",      <Info />],
  ["dark",      <AlertCircle />],
] as const satisfies readonly [BadgeVariant, unknown][]

function AlertClosableDemo() {
  const [dismissed, setDismissed] = useState<Set<AlertVariant>>(new Set());
  const toggle = (v: AlertVariant) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });

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
        <button
          type="button"
          className="text-xs text-muted-foreground underline self-start"
          onClick={() => setDismissed(new Set())}
        >
          Reset
        </button>
      )}
    </div>
  );
}

export default function UiTestPage() {
  return (
    <div className="flex flex-col gap-16 p-8 max-w-3xl">
      <h1>UI Component Test</h1>

      {/* ── ALERT ── */}
      <section className="flex flex-col gap-10">
        <h4>Alert</h4>

        {/* Simple */}
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

        {/* With Icon */}
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

        {/* Closable */}
        <div className="flex flex-col gap-3">
          <h6>Closable</h6>
          <AlertClosableDemo />
        </div>

        {/* With Link */}
        <div className="flex flex-col gap-3">
          <h6>With Link</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant}>
                This is a {variant} alert with an{" "}
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#" onClick={(e) => e.preventDefault()}>example link</a>. Give it a click if you like.
              </Alert>
            ))}
          </div>
        </div>

        {/* Full — title + body */}
        <div className="flex flex-col gap-3">
          <h6>Title + Body</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant}>
                <AlertTitle>
                  This is a {variant} alert — check it out!
                </AlertTitle>
                <AlertDescription>{BODY_TEXT}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>

        {/* Full — icon + title + body */}
        <div className="flex flex-col gap-3">
          <h6>Icon + Title + Body</h6>
          <div className="flex flex-col gap-2">
            {COLORS.map((variant) => (
              <Alert key={variant} variant={variant} icon={ICONS[variant]}>
                <AlertTitle>
                  This is a {variant} alert — check it out!
                </AlertTitle>
                <AlertDescription>{BODY_TEXT}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      </section>

      {/* ── BADGE ── */}
      <section className="flex flex-col gap-10">
        <h4>Badge</h4>

        {/* Filled */}
        <div className="flex flex-col gap-3">
          <h6>Filled</h6>
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v}>{capitalize(v)}</Badge>
            ))}
          </div>
        </div>

        {/* Light */}
        <div className="flex flex-col gap-3">
          <h6>Light</h6>
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v} skin="light">{capitalize(v)}</Badge>
            ))}
          </div>
        </div>

        {/* Count + Icon — Filled */}
        <div className="flex flex-col gap-3">
          <h6>Count + Icon — Filled</h6>
          <div className="flex flex-col gap-2">
            {COUNT_ICON_VARIANTS.map(([v, icon], i) => (
              <div key={v} className="flex items-center gap-3">
                <Badge variant={v} className="size-5 justify-center p-0 text-[10px] font-semibold">{i + 1}</Badge>
                <Badge variant={v} className="size-5 justify-center p-0">{icon}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Count + Icon — Light */}
        <div className="flex flex-col gap-3">
          <h6>Count + Icon — Light</h6>
          <div className="flex flex-col gap-2">
            {COUNT_ICON_VARIANTS.map(([v, icon], i) => (
              <div key={v} className="flex items-center gap-3">
                <Badge variant={v} skin="light" className="size-5 justify-center p-0 text-[10px] font-semibold">{i + 1}</Badge>
                <Badge variant={v} skin="light" className="size-5 justify-center p-0">{icon}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Overlay */}
        <div className="flex flex-col gap-3">
          <h6>Notification Overlay</h6>
          <div className="flex flex-wrap gap-8">
            <div className="relative inline-flex">
              <Bell className="size-[22px] text-foreground" />
              <Badge variant="danger" className="absolute -top-1.5 -right-1.5 size-5 justify-center p-0 text-[10px]">7</Badge>
            </div>
            <div className="relative inline-flex">
              <User className="size-[22px] text-foreground" />
              <Badge variant="primary" className="absolute -top-1.5 -right-1.5 size-5 justify-center p-0 text-[10px]">3</Badge>
            </div>
            <div className="relative inline-flex">
              <Shield className="size-[22px] text-foreground" />
              <Badge variant="success" className="absolute -top-1.5 -right-1.5 size-5 justify-center p-0 text-[10px]">5</Badge>
            </div>
          </div>
        </div>

        {/* Dot */}
        <div className="flex flex-col gap-3">
          <h6>Dot</h6>
          <div className="flex flex-wrap gap-4">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v} skin="dot">
                <span className="size-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />
                {capitalize(v)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Large — Filled */}
        <div className="flex flex-col gap-3">
          <h6>Large — Filled</h6>
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v} size="md">{capitalize(v)}</Badge>
            ))}
          </div>
        </div>

        {/* Large — Light */}
        <div className="flex flex-col gap-3">
          <h6>Large — Light</h6>
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v} skin="light" size="md">{capitalize(v)}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCORDION ── */}
      <section className="flex flex-col gap-10">
        <h4>Accordion</h4>

        <div className="flex flex-col gap-4">
          <h6>Default</h6>
          <Accordion type="single" collapsible defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion Item #1</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion Item #2</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Accordion Item #3</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex flex-col gap-4">
          <h6>Default — With Icons</h6>
          <Accordion type="single" collapsible defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger icon={<Star size={18} />}>Accordion Item #1</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger icon={<Sun size={18} />}>Accordion Item #2</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger icon={<Moon size={18} />}>Accordion Item #3</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex flex-col gap-4">
          <h6>Default — Multiple</h6>
          <Accordion type="multiple" defaultValue={["item-1", "item-3"]}>
            <AccordionItem value="item-1">
              <AccordionTrigger icon={<Settings size={18} />}>Settings</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger icon={<Bell size={18} />}>Notifications</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger icon={<Shield size={18} />}>Security</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex flex-col gap-4">
          <h6>Border Styling</h6>
          <Accordion type="single" collapsible variant="border" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion Item #1</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion Item #2</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Accordion Item #3</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex flex-col gap-4">
          <h6>Border Styling — With Icons</h6>
          <Accordion type="single" collapsible variant="border" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger icon={<Star size={18} />}>Accordion Item #1</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger icon={<Sun size={18} />}>Accordion Item #2</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger icon={<Moon size={18} />}>Accordion Item #3</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex flex-col gap-4">
          <h6>Advance Styling</h6>
          <Accordion type="single" collapsible variant="advance" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion Item #1</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion Item #2</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Accordion Item #3</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex flex-col gap-4">
          <h6>Advance Styling — With Icons</h6>
          <Accordion type="single" collapsible variant="advance" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger icon={<Star size={18} />}>Accordion Item #1</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger icon={<Sun size={18} />}>Accordion Item #2</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger icon={<Moon size={18} />}>Accordion Item #3</AccordionTrigger>
              <AccordionContent>{BODY_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
