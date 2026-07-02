"use client"

import { useState } from "react"
import {
  Settings, User, LogOut, CreditCard, Mail, MessageSquare,
  PlusCircle, Plus, GitBranch, LifeBuoy, Cloud, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverBody,
} from "@/components/ui/popover"
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

function DropdownCheckboxDemo() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showActivityBar, setShowActivityBar] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Checkbox Items</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar} disabled>
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DropdownRadioDemo() {
  const [position, setPosition] = useState("bottom")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Radio Items</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function OverlayPage() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-16">
        <h1>Overlay</h1>

        {/* ── TOOLTIP ── */}
        <section className="flex flex-col gap-10">
          <h4>Tooltip</h4>

          <div className="flex flex-col gap-3">
            <h6>Basic</h6>
            <div className="flex flex-wrap items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Simple tooltip text</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon"><Settings /></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon"><User /></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View profile</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h6>Placements</h6>
            <div className="flex flex-wrap items-center gap-4">
              {(["top", "right", "bottom", "left"] as const).map(side => (
                <Tooltip key={side}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">{side}</Button>
                  </TooltipTrigger>
                  <TooltipContent side={side}>
                    <p>Tooltip on {side}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </section>

        {/* ── POPOVER ── */}
        <section className="flex flex-col gap-10">
          <h4>Popover</h4>

          <div className="flex flex-col gap-3">
            <h6>Basic</h6>
            <div className="flex flex-wrap gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverTitle>Simple Popover</PopoverTitle>
                  <PopoverBody>This is a basic popover. It can contain any content.</PopoverBody>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h6>Placements</h6>
            <div className="flex flex-wrap gap-4">
              {(["top", "right", "bottom", "left"] as const).map(side => (
                <Popover key={side}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">{side}</Button>
                  </PopoverTrigger>
                  <PopoverContent side={side}>
                    <PopoverTitle>Popover — {side}</PopoverTitle>
                    <PopoverBody>Opens from the {side} side.</PopoverBody>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h6>With Actions</h6>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="self-start">Update Dimensions</Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverTitle>Dimensions</PopoverTitle>
                <PopoverBody>Set the dimensions for the layer.</PopoverBody>
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pop-width">Width</Label>
                    <Input id="pop-width" defaultValue="100%" size="sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pop-max-width">Max. width</Label>
                    <Input id="pop-max-width" defaultValue="300px" size="sm" />
                  </div>
                  <Button size="sm" className="w-full mt-1">Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* ── DROPDOWN MENU ── */}
        <section className="flex flex-col gap-10">
          <h4>Dropdown Menu</h4>

          <div className="flex flex-col gap-3">
            <h6>Basic</h6>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="self-start">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User /> Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard /> Billing
                  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings /> Settings
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut /> Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-3">
            <h6>With Groups</h6>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="self-start">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem><Plus /> New file</DropdownMenuItem>
                  <DropdownMenuItem><PlusCircle /> New folder</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Share</DropdownMenuLabel>
                  <DropdownMenuItem><Mail /> Email</DropdownMenuItem>
                  <DropdownMenuItem><MessageSquare /> Message</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem><GitBranch /> GitHub</DropdownMenuItem>
                <DropdownMenuItem><LifeBuoy /> Support</DropdownMenuItem>
                <DropdownMenuItem disabled><Cloud /> API (disabled)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-3">
            <h6>Checkbox &amp; Radio Items</h6>
            <div className="flex flex-wrap gap-3">
              <DropdownCheckboxDemo />
              <DropdownRadioDemo />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h6>Sub Menu</h6>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="self-start">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem><User /> Profile</DropdownMenuItem>
                <DropdownMenuItem><CreditCard /> Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Mail /> Email
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Send in a day</DropdownMenuItem>
                    <DropdownMenuItem>Send in a week</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Send now</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem><LogOut /> Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>
      </div>
    </TooltipProvider>
  )
}
