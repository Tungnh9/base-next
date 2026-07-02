"use client"

import {
  Star, Bell, User, Shield,
  AlertTriangle, CheckCircle, XCircle, Info, AlertCircle,
} from "lucide-react"
import {
  Avatar, AvatarImage, AvatarFallback, AvatarGroup,
  type AvatarColor, type AvatarStatus,
} from "@/components/ui/avatar"
import { Badge, type BadgeVariant } from "@/components/ui/badge"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardItem, CardFooter, CardImage,
} from "@/components/ui/card"
import {
  Progress, ProgressStack, ProgressSegment, type ProgressVariant,
} from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Carousel, type CarouselSlide } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

const placeholderPhoto = (color: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/><circle cx="50" cy="38" r="18" fill="#fff" fill-opacity="0.9"/><ellipse cx="50" cy="92" rx="32" ry="26" fill="#fff" fill-opacity="0.9"/></svg>`
  )

const PLACEHOLDER_PHOTO = placeholderPhoto("#7367F0")
const PLACEHOLDER_PHOTOS = [placeholderPhoto("#EA5455"), placeholderPhoto("#7367F0"), placeholderPhoto("#FF9F43")]

const AVATAR_SIZES = [26, 32, 38, 48, 64, 72] as const
const AVATAR_COLORS: AvatarColor[] = ["primary", "secondary", "success", "danger", "warning", "info"]
const AVATAR_STATUSES: AvatarStatus[] = ["online", "offline", "busy", "away"]

const BADGE_VARIANTS: BadgeVariant[] = ["primary", "secondary", "success", "danger", "warning", "info", "dark"]

const COUNT_ICON_VARIANTS = [
  ["primary",   <Star key="primary" />],
  ["secondary", <Star key="secondary" />],
  ["success",   <CheckCircle key="success" />],
  ["danger",    <XCircle key="danger" />],
  ["warning",   <AlertTriangle key="warning" />],
  ["info",      <Info key="info" />],
  ["dark",      <AlertCircle key="dark" />],
] as const satisfies readonly [BadgeVariant, unknown][]

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const CAROUSEL_SLIDES: CarouselSlide[] = [
  { image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80", alt: "Donuts", title: "First Slide" },
  { image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80", alt: "City", title: "Second Slide" },
  { image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=80", alt: "Oranges", title: "Third Slide" },
]

const CARD_PLACEHOLDER = placeholderPhoto("#7367F0")

export default function DisplayPage() {
  return (
    <div className="flex flex-col gap-16">
      <h1>Display</h1>

      {/* ── CARD ── */}
      <section className="flex flex-col gap-10">
        <h4>Card</h4>

        <div className="flex flex-col gap-3">
          <h6>Basic</h6>
          <Card className="max-w-sm">
            <CardContent>
              <CardTitle>Basic Card</CardTitle>
              <CardDescription>A simple card with content area only.</CardDescription>
              <p className="text-sm text-muted-foreground mt-2">Some descriptive text goes here. Cards are flexible containers for grouping related content.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Header</h6>
          <Card className="max-w-sm">
            <CardHeader>Card Title</CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Content area below the header. Use this for primary card body.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Header &amp; Footer</h6>
          <Card className="max-w-sm">
            <CardHeader>Card Title</CardHeader>
            <CardContent>
              <CardTitle>Featured Project</CardTitle>
              <CardDescription>A longer description about this project and what it does.</CardDescription>
            </CardContent>
            <CardFooter className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Image</h6>
          <Card className="max-w-sm">
            <CardImage
              src={CARD_PLACEHOLDER}
              alt="Card image"
              className="h-40 object-cover"
            />
            <CardContent>
              <CardTitle>Card with Image</CardTitle>
              <CardDescription>Images render above the content area.</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <h6>List Items</h6>
          <Card className="max-w-sm">
            <CardHeader>Team Members</CardHeader>
            <CardItem className="flex justify-between items-center py-3">
              <span className="text-sm font-medium">Alice Johnson</span>
              <Badge variant="success" skin="light">Active</Badge>
            </CardItem>
            <CardItem className="flex justify-between items-center py-3">
              <span className="text-sm font-medium">Bob Smith</span>
              <Badge variant="warning" skin="light">Pending</Badge>
            </CardItem>
            <CardItem className="flex justify-between items-center py-3">
              <span className="text-sm font-medium">Carol Davis</span>
              <Badge variant="danger" skin="light">Inactive</Badge>
            </CardItem>
          </Card>
        </div>
      </section>

      {/* ── AVATAR ── */}
      <section className="flex flex-col gap-10">
        <h4>Avatar</h4>

        <div className="flex flex-col gap-3">
          <h6>Sizes (image)</h6>
          <div className="flex flex-wrap items-end gap-3">
            {AVATAR_SIZES.map((size) => (
              <Avatar key={size} size={size}>
                <AvatarImage src={PLACEHOLDER_PHOTO} alt="User avatar" />
                <AvatarFallback size={size}>PI</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Initials — filled</h6>
          <div className="flex flex-col gap-3">
            {AVATAR_COLORS.map((color) => (
              <div key={color} className="flex flex-wrap items-end gap-3">
                {AVATAR_SIZES.map((size) => (
                  <Avatar key={size} size={size}>
                    <AvatarFallback size={size} color={color} skin="filled">PI</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Initials — light</h6>
          <div className="flex flex-col gap-3">
            {AVATAR_COLORS.map((color) => (
              <div key={color} className="flex flex-wrap items-end gap-3">
                {AVATAR_SIZES.map((size) => (
                  <Avatar key={size} size={size}>
                    <AvatarFallback size={size} color={color} skin="light">PI</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Status indicator</h6>
          <div className="flex flex-wrap items-end gap-3">
            {AVATAR_STATUSES.map((status) => (
              <Avatar key={status} size={38} status={status}>
                <AvatarImage src={PLACEHOLDER_PHOTO} alt="User avatar" />
                <AvatarFallback size={38}>PI</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Avatar group</h6>
          <div className="flex flex-wrap items-center gap-6">
            <AvatarGroup size={38} max={3}>
              <Avatar size={38}><AvatarImage src={PLACEHOLDER_PHOTOS[0]} alt="" /><AvatarFallback size={38} color="danger">PI</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarImage src={PLACEHOLDER_PHOTOS[1]} alt="" /><AvatarFallback size={38} color="primary">PI</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarImage src={PLACEHOLDER_PHOTOS[2]} alt="" /><AvatarFallback size={38} color="warning">PI</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="success">PI</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="info">PI</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="secondary">PI</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="primary">PI</AvatarFallback></Avatar>
            </AvatarGroup>
            <AvatarGroup size={38} max={3}>
              <Avatar size={38}><AvatarFallback size={38} color="danger">AB</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="primary">CD</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="warning">EF</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="success">GH</AvatarFallback></Avatar>
              <Avatar size={38}><AvatarFallback size={38} color="info">IJ</AvatarFallback></Avatar>
            </AvatarGroup>
          </div>
        </div>
      </section>

      {/* ── BADGE ── */}
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
          <h6>Large</h6>
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v} size="md">{capitalize(v)}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRESS ── */}
      <section className="flex flex-col gap-10">
        <h4>Progress</h4>

        <div className="flex flex-col gap-4">
          <h6>Default</h6>
          {(["primary", "secondary", "success", "danger", "warning", "info", "dark"] as ProgressVariant[]).map(
            (variant) => (
              <Progress key={variant} variant={variant} value={variant === "primary" ? 75 : variant === "secondary" ? 50 : variant === "success" ? 80 : variant === "danger" ? 45 : variant === "warning" ? 65 : variant === "info" ? 90 : 55} />
            )
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h6>Striped</h6>
          {(["primary", "secondary", "success", "danger", "warning", "info", "dark"] as ProgressVariant[]).map(
            (variant) => (
              <Progress key={variant} variant={variant} skin="striped" value={variant === "primary" ? 75 : variant === "secondary" ? 50 : variant === "success" ? 80 : variant === "danger" ? 45 : variant === "warning" ? 65 : variant === "info" ? 90 : 55} />
            )
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h6>Sizes</h6>
          <Progress size="sm" value={60} />
          <Progress size="default" value={60} />
          <Progress size="lg" value={60} />
        </div>

        <div className="flex flex-col gap-4">
          <h6>Stacked</h6>
          <ProgressStack value={100}>
            <ProgressSegment variant="primary" value={35} />
            <ProgressSegment variant="success" value={20} />
            <ProgressSegment variant="warning" value={15} />
            <ProgressSegment variant="info" value={30} />
          </ProgressStack>
          <ProgressStack value={100}>
            <ProgressSegment variant="primary" value={45} skin="striped" />
            <ProgressSegment variant="danger" value={20} skin="striped" />
            <ProgressSegment variant="warning" value={35} skin="striped" />
          </ProgressStack>
        </div>
      </section>

      {/* ── CAROUSEL ── */}
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
          <Carousel
            variant="with-caption"
            slides={[
              { image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80", alt: "Donuts", label: "First slide label", description: "Some representative placeholder content for the first slide." },
              { image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80", alt: "City", label: "Second slide label", description: "Some representative placeholder content for the second slide." },
              { image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=80", alt: "Oranges", label: "Third slide label", description: "Some representative placeholder content for the third slide." },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h6>With AutoPlay</h6>
          <Carousel variant="with-indicator" slides={CAROUSEL_SLIDES} autoPlay interval={3000} />
        </div>
      </section>

      {/* ── SEPARATOR ── */}
      <section className="flex flex-col gap-10">
        <h4>Separator</h4>

        <div className="flex flex-col gap-3">
          <h6>Horizontal</h6>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Content above separator</p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">Content below separator</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Vertical</h6>
          <div className="flex items-center gap-4 h-8">
            <span className="text-sm text-muted-foreground">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-muted-foreground">Center</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-muted-foreground">Right</span>
          </div>
        </div>
      </section>
    </div>
  )
}
