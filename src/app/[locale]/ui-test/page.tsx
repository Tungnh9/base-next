"use client"

import { useState } from "react";
import {
  Star, Sun, Moon, Settings, Bell, Shield,
  Info, AlertTriangle, CheckCircle, XCircle, User, AlertCircle, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, type CarouselSlide } from "@/components/ui/carousel";
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
import {
  Card, CardImage, CardHeader, CardTitle, CardDescription,
  CardContent, CardItem, CardFooter,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ButtonGroup } from "@/components/ui/button-group";

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
        <Button
          variant="link"
          size="sm"
          type="button"
          className="h-auto p-0 text-xs text-muted-foreground self-start"
          onClick={() => setDismissed(new Set())}
        >
          Reset
        </Button>
      )}
    </div>
  );
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80",
    alt: "Donuts and milk",
    title: "First Slide",
  },
  {
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
    alt: "City building",
    title: "Second Slide",
  },
  {
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=80",
    alt: "Oranges and ice",
    title: "Third Slide",
  },
]

const CAROUSEL_CAPTION_SLIDES: CarouselSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80",
    alt: "Donuts and milk",
    label: "First slide label",
    description: "Some representative placeholder content for the first slide.",
  },
  {
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
    alt: "City building",
    label: "Second slide label",
    description: "Some representative placeholder content for the second slide.",
  },
  {
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=80",
    alt: "Oranges and ice",
    label: "Third slide label",
    description: "Some representative placeholder content for the third slide.",
  },
]

const TABS = [
  "Button",
  "ButtonGroup",
  "Alert",
  "Badge",
  "Breadcrumb",
  "Card",
  "Accordion",
  "Carousel",
] as const

type Tab = typeof TABS[number]

export default function UiTestPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Button")

  return (
    <div className="flex flex-col gap-0 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-8 py-4">
        <h4 className="mb-4 text-foreground">UI Component Test</h4>
        <nav className="flex gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-8 max-w-3xl w-full">

        {/* ── BUTTON ── */}
        {activeTab === "Button" && (
          <section className="flex flex-col gap-10">
            <h4>Button</h4>

            <div className="flex flex-col gap-3">
              <h6>Filled</h6>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="destructive">Danger</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
                <Button variant="dark">Dark</Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Outline</h6>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline">Default</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Ghost (Label) & Link</h6>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost">Default</Button>
                <Button variant="ghost" size="lg">Large</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Sizes</h6>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>With Icons</h6>
              <div className="flex flex-wrap items-center gap-3">
                <Button><Star /> Left Icon</Button>
                <Button>Right Icon <Star /></Button>
                <Button variant="outline"><Star /> Outline</Button>
                <Button size="icon"><Star /></Button>
                <Button size="icon" variant="outline"><Star /></Button>
                <Button size="icon" variant="ghost"><Star /></Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h6>States</h6>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[88px_repeat(5,auto)] gap-x-4 gap-y-3 items-center min-w-max">
                  <div />
                  {(["Default", "Hover", "Active", "Focus", "Disabled"] as const).map(s => (
                    <div key={s} className="text-xs font-semibold text-muted-foreground text-center px-1">{s}</div>
                  ))}

                  <div className="text-xs text-muted-foreground font-medium self-center">Filled</div>
                  <Button>Button</Button>
                  <Button style={{ filter: "brightness(0.9)" }}>Button</Button>
                  <Button style={{ filter: "brightness(0.85)" }}>Button</Button>
                  <Button style={{ filter: "brightness(0.9)", boxShadow: "0 0 0 3px rgba(115,103,240,0.5), 0px 2px 4px rgba(165,163,174,0.3)" }}>Button</Button>
                  <Button disabled>Button</Button>

                  <div className="text-xs text-muted-foreground font-medium self-center">Outline</div>
                  <Button variant="outline">Button</Button>
                  <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.1)" }}>Button</Button>
                  <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.15)" }}>Button</Button>
                  <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.1)", boxShadow: "0 0 0 3px rgba(115,103,240,0.5)" }}>Button</Button>
                  <Button variant="outline" disabled>Button</Button>

                  <div className="text-xs text-muted-foreground font-medium self-center">Ghost</div>
                  <Button variant="ghost">Button</Button>
                  <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.24)" }}>Button</Button>
                  <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.28)" }}>Button</Button>
                  <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.24)", boxShadow: "0 0 0 3px rgba(115,103,240,0.5)" }}>Button</Button>
                  <Button variant="ghost" disabled>Button</Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Disabled</h6>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Primary</Button>
                <Button variant="secondary" disabled>Secondary</Button>
                <Button variant="success" disabled>Success</Button>
                <Button variant="destructive" disabled>Danger</Button>
                <Button variant="warning" disabled>Warning</Button>
                <Button variant="info" disabled>Info</Button>
                <Button variant="dark" disabled>Dark</Button>
                <Button variant="outline" disabled>Outline</Button>
                <Button variant="ghost" disabled>Ghost</Button>
              </div>
            </div>
          </section>
        )}

        {/* ── BUTTON GROUP ── */}
        {activeTab === "ButtonGroup" && (
          <section className="flex flex-col gap-10">
            <h4>Button Group</h4>

            {/* Filled */}
            <div className="flex flex-col gap-4">
              <h6>Filled</h6>
              <div className="flex flex-col gap-4">
                {(
                  [
                    ["default",     "Primary"],
                    ["secondary",   "Secondary"],
                    ["success",     "Success"],
                    ["destructive", "Danger"],
                    ["warning",     "Warning"],
                    ["info",        "Info"],
                    ["dark",        "Dark"],
                  ] as const
                ).map(([v, label]) => (
                  <div key={v} className="flex flex-wrap items-center gap-4">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
                    <ButtonGroup variant={v}>
                      <Button>Left</Button>
                      <Button>Right</Button>
                    </ButtonGroup>
                    <ButtonGroup variant={v}>
                      <Button>Left</Button>
                      <Button>Middle</Button>
                      <Button>Right</Button>
                    </ButtonGroup>
                    <ButtonGroup variant={v}>
                      <Button>Left</Button>
                      <Button>Middle</Button>
                      <Button>Middle</Button>
                      <Button>Right</Button>
                    </ButtonGroup>
                    <ButtonGroup variant={v}>
                      <Button>Left</Button>
                      <Button>Middle</Button>
                      <Button>Middle</Button>
                      <Button>Middle</Button>
                      <Button>Right</Button>
                    </ButtonGroup>
                  </div>
                ))}
              </div>
            </div>

            {/* Outline */}
            <div className="flex flex-col gap-3">
              <h6>Outline</h6>
              <div className="flex flex-wrap items-center gap-4">
                <ButtonGroup variant="outline">
                  <Button>Left</Button>
                  <Button>Right</Button>
                </ButtonGroup>
                <ButtonGroup variant="outline">
                  <Button>Left</Button>
                  <Button>Middle</Button>
                  <Button>Right</Button>
                </ButtonGroup>
                <ButtonGroup variant="outline">
                  <Button>Left</Button>
                  <Button>Middle</Button>
                  <Button>Middle</Button>
                  <Button>Right</Button>
                </ButtonGroup>
                <ButtonGroup variant="outline">
                  <Button>Left</Button>
                  <Button>Middle</Button>
                  <Button>Middle</Button>
                  <Button>Middle</Button>
                  <Button>Right</Button>
                </ButtonGroup>
              </div>
            </div>

            {/* Sizes */}
            <div className="flex flex-col gap-3">
              <h6>Sizes</h6>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">Small</span>
                  <ButtonGroup variant="default" size="sm">
                    <Button>Left</Button>
                    <Button>Middle</Button>
                    <Button>Right</Button>
                  </ButtonGroup>
                  <ButtonGroup variant="outline" size="sm">
                    <Button>Left</Button>
                    <Button>Middle</Button>
                    <Button>Right</Button>
                  </ButtonGroup>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">Default</span>
                  <ButtonGroup variant="default">
                    <Button>Left</Button>
                    <Button>Middle</Button>
                    <Button>Right</Button>
                  </ButtonGroup>
                  <ButtonGroup variant="outline">
                    <Button>Left</Button>
                    <Button>Middle</Button>
                    <Button>Right</Button>
                  </ButtonGroup>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">Large</span>
                  <ButtonGroup variant="default" size="lg">
                    <Button>Left</Button>
                    <Button>Middle</Button>
                    <Button>Right</Button>
                  </ButtonGroup>
                  <ButtonGroup variant="outline" size="lg">
                    <Button>Left</Button>
                    <Button>Middle</Button>
                    <Button>Right</Button>
                  </ButtonGroup>
                </div>
              </div>
            </div>

            {/* Vertical */}
            <div className="flex flex-col gap-3">
              <h6>Vertical</h6>
              <div className="flex flex-wrap items-start gap-6">
                {(
                  [
                    ["default",     "Primary"],
                    ["secondary",   "Secondary"],
                    ["success",     "Success"],
                    ["destructive", "Danger"],
                    ["warning",     "Warning"],
                    ["info",        "Info"],
                    ["dark",        "Dark"],
                    ["outline",     "Outline"],
                  ] as const
                ).map(([v, label]) => (
                  <div key={v} className="flex flex-col items-center gap-2">
                    <ButtonGroup variant={v} orientation="vertical">
                      <Button>Top</Button>
                      <Button>Middle</Button>
                      <Button>Bottom</Button>
                    </ButtonGroup>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── ALERT ── */}
        {activeTab === "Alert" && (
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
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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
                    <AlertTitle>
                      This is a {variant} alert — check it out!
                    </AlertTitle>
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
                    <AlertTitle>
                      This is a {variant} alert — check it out!
                    </AlertTitle>
                    <AlertDescription>{BODY_TEXT}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── BADGE ── */}
        {activeTab === "Badge" && (
          <section className="flex flex-col gap-10">
            <h4>Badge</h4>

            <div className="flex flex-col gap-3">
              <h6>Filled</h6>
              <div className="flex flex-wrap gap-2">
                {BADGE_VARIANTS.map((v) => (
                  <Badge key={v} variant={v}>{capitalize(v)}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Light</h6>
              <div className="flex flex-wrap gap-2">
                {BADGE_VARIANTS.map((v) => (
                  <Badge key={v} variant={v} skin="light">{capitalize(v)}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Count + Icon — Filled</h6>
              <div className="flex flex-col gap-2">
                {COUNT_ICON_VARIANTS.map(([v, icon], i) => (
                  <div key={v} className="flex items-center gap-3">
                    <Badge variant={v} className="size-6 justify-center p-0 rounded-[4px] text-[13px] font-semibold">{i + 1}</Badge>
                    <Badge variant={v} className="size-6 justify-center p-0 rounded-[4px] [&_svg]:size-4">{icon}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Count + Icon — Light</h6>
              <div className="flex flex-col gap-2">
                {COUNT_ICON_VARIANTS.map(([v, icon], i) => (
                  <div key={v} className="flex items-center gap-3">
                    <Badge variant={v} skin="light" className="size-6 justify-center p-0 rounded-[4px] text-[13px] font-semibold">{i + 1}</Badge>
                    <Badge variant={v} skin="light" className="size-6 justify-center p-0 rounded-[4px] [&_svg]:size-4">{icon}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Notification Overlay</h6>
              <div className="flex flex-wrap gap-8">
                <div className="relative inline-flex">
                  <Bell className="size-[22px] text-foreground" />
                  <Badge variant="danger" className="absolute -top-1.5 -right-1.5 size-4 justify-center p-0 text-[10px]">7</Badge>
                </div>
                <div className="relative inline-flex">
                  <User className="size-[22px] text-foreground" />
                  <Badge variant="primary" className="absolute -top-1.5 -right-1.5 size-4 justify-center p-0 text-[10px]">3</Badge>
                </div>
                <div className="relative inline-flex">
                  <Shield className="size-[22px] text-foreground" />
                  <Badge variant="success" className="absolute -top-1.5 -right-1.5 size-4 justify-center p-0 text-[10px]">5</Badge>
                </div>
              </div>
            </div>

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

            <div className="flex flex-col gap-3">
              <h6>Large — Filled</h6>
              <div className="flex flex-wrap gap-2">
                {BADGE_VARIANTS.map((v) => (
                  <Badge key={v} variant={v} size="md">{capitalize(v)}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Large — Light</h6>
              <div className="flex flex-wrap gap-2">
                {BADGE_VARIANTS.map((v) => (
                  <Badge key={v} variant={v} skin="light" size="md">{capitalize(v)}</Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── BREADCRUMB ── */}
        {activeTab === "Breadcrumb" && (
          <section className="flex flex-col gap-10">
            <h4>Breadcrumb</h4>

            <div className="flex flex-col gap-3">
              <h6>Chevron</h6>
              <Breadcrumb separator="chevron">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#"><Home className="size-4" /> Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Library</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Slash</h6>
              <Breadcrumb separator="slash">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Library</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex flex-col gap-3">
              <h6>Check</h6>
              <Breadcrumb separator="check">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Library</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </section>
        )}

        {/* ── CARD ── */}
        {activeTab === "Card" && (
          <section className="flex flex-col gap-6">
            <h4>Card</h4>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardImage src="https://picsum.photos/seed/arch/400/200" className="h-48" />
                <CardContent>
                  <CardTitle>Card Title</CardTitle>
                  <p className="text-sm">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
                  <div>
                    <Button>Button</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardImage src="https://picsum.photos/seed/food/400/200" className="h-48" />
                <CardContent>
                  <p className="text-sm">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6 items-start">
              <Card>
                <CardImage src="https://picsum.photos/seed/city/400/240" className="h-52" />
                <CardContent>
                  <CardTitle>Card Title</CardTitle>
                  <p className="text-sm">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
                </CardContent>
                <CardItem>An item</CardItem>
                <CardItem>A second item</CardItem>
                <CardItem>A third item</CardItem>
                <div className="flex gap-4 px-6 py-4">
                  <a href="#" className="text-sm text-primary hover:underline">Card Links</a>
                  <a href="#" className="text-sm text-primary hover:underline">Another Links</a>
                </div>
              </Card>

              <div className="flex flex-col gap-6">
                <Card>
                  <CardContent>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Subtitle</CardDescription>
                    <p className="text-sm">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
                    <div className="flex gap-4">
                      <a href="#" className="text-sm text-primary hover:underline">Card Links</a>
                      <a href="#" className="text-sm text-primary hover:underline">Another Links</a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>Header</CardHeader>
                  <CardItem>An item</CardItem>
                  <CardItem>A second item</CardItem>
                  <CardItem>A third item</CardItem>
                  <CardFooter>Footer</CardFooter>
                </Card>

                <Card>
                  <CardContent>
                    <p className="text-sm">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="flex-row">
              <CardImage
                src="https://picsum.photos/seed/avocado/300/400"
                className="w-48 h-auto min-h-[220px] shrink-0 object-cover"
              />
              <CardContent className="flex-1">
                <CardTitle>Card Title</CardTitle>
                <p className="text-sm">Some quick example text to build on the card title and make up the bulk of the card&apos;s content.</p>
                <div>
                  <Button>Button</Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ── ACCORDION ── */}
        {activeTab === "Accordion" && (
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
        )}

        {/* ── CAROUSEL ── */}
        {activeTab === "Carousel" && (
          <section className="flex flex-col gap-10">
            <h4>Carousel</h4>

            <div className="flex flex-col gap-3">
              <h6>Slide Only</h6>
              <Carousel variant="slide-only" slides={CAROUSEL_SLIDES} />
            </div>

            <div className="flex flex-col gap-3">
              <h6>With Control</h6>
              <Carousel variant="with-control" slides={CAROUSEL_SLIDES} />
            </div>

            <div className="flex flex-col gap-3">
              <h6>With Indicator</h6>
              <Carousel variant="with-indicator" slides={CAROUSEL_SLIDES} />
            </div>

            <div className="flex flex-col gap-3">
              <h6>With Caption</h6>
              <Carousel variant="with-caption" slides={CAROUSEL_CAPTION_SLIDES} />
            </div>

            <div className="flex flex-col gap-3">
              <h6>With AutoPlay</h6>
              <Carousel
                variant="with-indicator"
                slides={CAROUSEL_SLIDES}
                autoPlay
                interval={3000}
              />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
