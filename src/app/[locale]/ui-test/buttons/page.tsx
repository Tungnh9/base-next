"use client"

import { Star, Settings, CheckCircle, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function ButtonsPage() {
  return (
    <div className="flex flex-col gap-16">
      <h1>Buttons</h1>

      {/* ── BUTTON ── */}
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
            <Button variant="outline" size="sm">
              Small
            </Button>
            <Button variant="outline">Default</Button>
            <Button variant="outline" size="lg">
              Large
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Ghost &amp; Link</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm">
              Small
            </Button>
            <Button variant="ghost">Default</Button>
            <Button variant="ghost" size="lg">
              Large
            </Button>
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
            <Button>
              <Star /> Left Icon
            </Button>
            <Button>
              Right Icon <Star />
            </Button>
            <Button variant="outline">
              <Star /> Outline
            </Button>
            <Button size="icon">
              <Star />
            </Button>
            <Button size="icon" variant="outline">
              <Star />
            </Button>
            <Button size="icon" variant="ghost">
              <Star />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h6>States</h6>
          <div className="overflow-x-auto">
            <div className="grid min-w-max grid-cols-[88px_repeat(5,auto)] items-center gap-x-4 gap-y-3">
              <div />
              {(["Default", "Hover", "Active", "Focus", "Disabled"] as const).map((s) => (
                <div
                  key={s}
                  className="text-muted-foreground px-1 text-center text-xs font-semibold"
                >
                  {s}
                </div>
              ))}

              <div className="text-muted-foreground self-center text-xs font-medium">Filled</div>
              <Button>Button</Button>
              <Button style={{ filter: "brightness(0.9)" }}>Button</Button>
              <Button style={{ filter: "brightness(0.85)" }}>Button</Button>
              <Button
                style={{
                  filter: "brightness(0.9)",
                  boxShadow: "0 0 0 3px rgba(115,103,240,0.5), 0px 2px 4px rgba(165,163,174,0.3)",
                }}
              >
                Button
              </Button>
              <Button disabled>Button</Button>

              <div className="text-muted-foreground self-center text-xs font-medium">Outline</div>
              <Button variant="outline">Button</Button>
              <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.1)" }}>
                Button
              </Button>
              <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.15)" }}>
                Button
              </Button>
              <Button
                variant="outline"
                style={{
                  backgroundColor: "rgba(115,103,240,0.1)",
                  boxShadow: "0 0 0 3px rgba(115,103,240,0.5)",
                }}
              >
                Button
              </Button>
              <Button variant="outline" disabled>
                Button
              </Button>

              <div className="text-muted-foreground self-center text-xs font-medium">Ghost</div>
              <Button variant="ghost">Button</Button>
              <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.24)" }}>
                Button
              </Button>
              <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.28)" }}>
                Button
              </Button>
              <Button
                variant="ghost"
                style={{
                  backgroundColor: "rgba(115,103,240,0.24)",
                  boxShadow: "0 0 0 3px rgba(115,103,240,0.5)",
                }}
              >
                Button
              </Button>
              <Button variant="ghost" disabled>
                Button
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Disabled</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Primary</Button>
            <Button variant="secondary" disabled>
              Secondary
            </Button>
            <Button variant="success" disabled>
              Success
            </Button>
            <Button variant="destructive" disabled>
              Danger
            </Button>
            <Button variant="warning" disabled>
              Warning
            </Button>
            <Button variant="info" disabled>
              Info
            </Button>
            <Button variant="dark" disabled>
              Dark
            </Button>
            <Button variant="outline" disabled>
              Outline
            </Button>
            <Button variant="ghost" disabled>
              Ghost
            </Button>
          </div>
        </div>
      </section>

      {/* ── BUTTON GROUP ── */}
      <section className="flex flex-col gap-10">
        <h4>Button Group</h4>

        <div className="flex flex-col gap-3">
          <h6>Filled — Horizontal</h6>
          <div className="flex flex-wrap gap-4">
            <ButtonGroup>
              <Button>Left</Button>
              <Button>Middle</Button>
              <Button>Right</Button>
            </ButtonGroup>
            <ButtonGroup variant="secondary">
              <Button variant="secondary">Left</Button>
              <Button variant="secondary">Middle</Button>
              <Button variant="secondary">Right</Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Outline — Horizontal</h6>
          <div className="flex flex-wrap gap-4">
            <ButtonGroup variant="outline">
              <Button variant="outline">Left</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
            <ButtonGroup variant="outline">
              <Button variant="outline" size="sm">
                Small
              </Button>
              <Button variant="outline" size="sm">
                Small
              </Button>
              <Button variant="outline" size="sm">
                Small
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Icons</h6>
          <div className="flex flex-wrap gap-4">
            <ButtonGroup variant="outline">
              <Button variant="outline" size="icon">
                <AlertCircle />
              </Button>
              <Button variant="outline" size="icon">
                <Info />
              </Button>
              <Button variant="outline" size="icon">
                <CheckCircle />
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button>
                <Star /> Save
              </Button>
              <Button>
                <Settings /> Settings
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Vertical</h6>
          <div className="flex flex-wrap gap-6">
            <ButtonGroup orientation="vertical">
              <Button>Top</Button>
              <Button>Middle</Button>
              <Button>Bottom</Button>
            </ButtonGroup>
            <ButtonGroup orientation="vertical" variant="outline">
              <Button variant="outline">Top</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Bottom</Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Color Variants</h6>
          <div className="flex flex-col gap-3">
            {(
              ["default", "secondary", "success", "destructive", "warning", "info", "dark"] as const
            ).map((v) => (
              <ButtonGroup key={v} variant={v}>
                <Button variant={v}>Left</Button>
                <Button variant={v}>Middle</Button>
                <Button variant={v}>Right</Button>
              </ButtonGroup>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
