"use client"

import { useState } from "react";
import {
  Star, Sun, Moon, Settings, Bell, Shield,
  Info, AlertTriangle, CheckCircle, XCircle, User, AlertCircle, Home,
  Lock, Mail, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  type AvatarColor,
  type AvatarStatus,
} from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BODY_TEXT =
  "Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder. Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.";

// Inline placeholder photos so the Avatar demo below doesn't depend on an external URL.
const placeholderPhoto = (color: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/><circle cx="50" cy="38" r="18" fill="#fff" fill-opacity="0.9"/><ellipse cx="50" cy="92" rx="32" ry="26" fill="#fff" fill-opacity="0.9"/></svg>`
  );
const PLACEHOLDER_PHOTO = placeholderPhoto("#7367F0");
const PLACEHOLDER_PHOTOS = [placeholderPhoto("#EA5455"), placeholderPhoto("#7367F0"), placeholderPhoto("#FF9F43")];

const AVATAR_SIZES = [26, 32, 38, 48, 64, 72] as const;
const AVATAR_COLORS: AvatarColor[] = ["primary", "secondary", "success", "danger", "warning", "info"];
const AVATAR_STATUSES: AvatarStatus[] = ["online", "offline", "busy", "away"];

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
  ["primary",   <Star key="primary" />],
  ["secondary", <Settings key="secondary" />],
  ["success",   <CheckCircle key="success" />],
  ["danger",    <XCircle key="danger" />],
  ["warning",   <AlertTriangle key="warning" />],
  ["info",      <Info key="info" />],
  ["dark",      <AlertCircle key="dark" />],
] as const satisfies readonly [BadgeVariant, unknown][]

function TagInputDemo({ variant, initialValues }: { variant: "select" | "tag"; initialValues: string[] }) {
  const [values, setValues] = useState(initialValues);
  const [inputValue, setInputValue] = useState("");

  return (
    <TagInput
      variant={variant}
      values={values}
      onRemove={(index) => setValues((prev) => prev.filter((_, i) => i !== index))}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      placeholder="Add an option..."
      onKeyDown={(e) => {
        if (e.key === "Enter" && inputValue.trim()) {
          e.preventDefault();
          setValues((prev) => [...prev, inputValue.trim()]);
          setInputValue("");
        }
      }}
      className="w-[250px]"
    />
  );
}

function FileUploadDemo({ multiple }: { multiple: boolean }) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FileUpload
      multiple={multiple}
      files={files}
      onFilesChange={setFiles}
      title="Drop files here or click to upload"
      subtitle={
        multiple
          ? "(You can select or drop multiple files.)"
          : "(Only one file is kept — a new selection replaces it.)"
      }
      removeLabel={(name) => `Remove ${name}`}
      className="w-full max-w-[500px]"
    />
  );
}

function AlertClosableDemo() {
  const [dismissed, setDismissed] = useState<Set<AlertVariant>>(new Set());
  const toggle = (v: AlertVariant) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      if (next.has(v)) {
        next.delete(v);
      } else {
        next.add(v);
      }
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

export default function UiTestPage() {
  return (
    <div className="flex flex-col gap-16 p-8 max-w-3xl">
      <h1>UI Component Test</h1>

      {/* ── BUTTON ── */}
      <section className="flex flex-col gap-10">
        <h4>Button</h4>

        {/* Filled */}
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

        {/* Outline */}
        <div className="flex flex-col gap-3">
          <h6>Outline</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm">Small</Button>
            <Button variant="outline">Default</Button>
            <Button variant="outline" size="lg">Large</Button>
          </div>
        </div>

        {/* Ghost & Link */}
        <div className="flex flex-col gap-3">
          <h6>Ghost (Label) & Link</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm">Small</Button>
            <Button variant="ghost">Default</Button>
            <Button variant="ghost" size="lg">Large</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* With Icons */}
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

        {/* States */}
        <div className="flex flex-col gap-4">
          <h6>States</h6>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[88px_repeat(5,auto)] gap-x-4 gap-y-3 items-center min-w-max">
              <div />
              {(["Default", "Hover", "Active", "Focus", "Disabled"] as const).map(s => (
                <div key={s} className="text-xs font-semibold text-muted-foreground text-center px-1">{s}</div>
              ))}

              {/* Filled */}
              <div className="text-xs text-muted-foreground font-medium self-center">Filled</div>
              <Button>Button</Button>
              <Button style={{ filter: "brightness(0.9)" }}>Button</Button>
              <Button style={{ filter: "brightness(0.85)" }}>Button</Button>
              <Button style={{ filter: "brightness(0.9)", boxShadow: "0 0 0 3px rgba(115,103,240,0.5), 0px 2px 4px rgba(165,163,174,0.3)" }}>Button</Button>
              <Button disabled>Button</Button>

              {/* Outline */}
              <div className="text-xs text-muted-foreground font-medium self-center">Outline</div>
              <Button variant="outline">Button</Button>
              <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.1)" }}>Button</Button>
              <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.15)" }}>Button</Button>
              <Button variant="outline" style={{ backgroundColor: "rgba(115,103,240,0.1)", boxShadow: "0 0 0 3px rgba(115,103,240,0.5)" }}>Button</Button>
              <Button variant="outline" disabled>Button</Button>

              {/* Ghost */}
              <div className="text-xs text-muted-foreground font-medium self-center">Ghost</div>
              <Button variant="ghost">Button</Button>
              <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.24)" }}>Button</Button>
              <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.28)" }}>Button</Button>
              <Button variant="ghost" style={{ backgroundColor: "rgba(115,103,240,0.24)", boxShadow: "0 0 0 3px rgba(115,103,240,0.5)" }}>Button</Button>
              <Button variant="ghost" disabled>Button</Button>
            </div>
          </div>
        </div>

        {/* Disabled */}
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

      {/* ── INPUT ── */}
      <section className="flex flex-col gap-10">
        <h4>Input</h4>

        {/* Sizes */}
        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input size="sm" placeholder="Small" className="w-[200px]" />
            <Input size="default" placeholder="Default" className="w-[200px]" />
            <Input size="lg" placeholder="Large" className="w-[200px]" />
          </div>
        </div>

        {/* States */}
        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Default" className="w-[200px]" />
            <Input defaultValue="Filled value" className="w-[200px]" />
            <Input placeholder="Read only" readOnly className="w-[200px]" />
            <Input placeholder="Disabled" disabled className="w-[200px]" />
          </div>
        </div>

        {/* Validation */}
        <div className="flex flex-col gap-3">
          <h6>Validation</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Valid" isValid={true} className="w-[200px]" />
            <Input placeholder="Invalid" aria-invalid className="w-[200px]" />
          </div>
        </div>

        {/* With Icons */}
        <div className="flex flex-col gap-3">
          <h6>With Icons</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Email" startIcon={<Mail />} className="w-[200px]" />
            <Input placeholder="Password" type="password" startIcon={<Lock />} className="w-[200px]" />
            <Input placeholder="Valid" isValid={true} endIcon={<Check className="text-success" />} className="w-[200px]" />
            <Input placeholder="Invalid" aria-invalid endIcon={<X className="text-destructive" />} className="w-[200px]" />
          </div>
        </div>

        {/* Sizes — With Icon */}
        <div className="flex flex-col gap-3">
          <h6>Sizes — With Icon</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input size="sm" placeholder="Small" startIcon={<Lock />} className="w-[200px]" />
            <Input size="default" placeholder="Default" startIcon={<Lock />} className="w-[200px]" />
            <Input size="lg" placeholder="Large" startIcon={<Lock />} className="w-[200px]" />
          </div>
        </div>

        {/* Multiple Select */}
        <div className="flex flex-col gap-3">
          <h6>Multiple Select</h6>
          <TagInputDemo variant="select" initialValues={["Option 1", "Option 2"]} />
        </div>

        {/* Tagify */}
        <div className="flex flex-col gap-3">
          <h6>Tagify</h6>
          <TagInputDemo variant="tag" initialValues={["Option 1", "Option 2"]} />
        </div>
      </section>

      {/* ── SELECT ── */}
      <section className="flex flex-col gap-10">
        <h4>Select</h4>

        {/* Sizes */}
        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Select>
              <SelectTrigger size="sm" className="w-[196px]">
                <SelectValue placeholder="Select Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Option One</SelectItem>
                <SelectItem value="two">Option Two</SelectItem>
                <SelectItem value="three">Option Three</SelectItem>
                <SelectItem value="four">Option Four</SelectItem>
                <SelectItem value="five">Option Five</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="default" className="w-[196px]">
                <SelectValue placeholder="Select Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Option One</SelectItem>
                <SelectItem value="two">Option Two</SelectItem>
                <SelectItem value="three">Option Three</SelectItem>
                <SelectItem value="four">Option Four</SelectItem>
                <SelectItem value="five">Option Five</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="lg" className="w-[196px]">
                <SelectValue placeholder="Select Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Option One</SelectItem>
                <SelectItem value="two">Option Two</SelectItem>
                <SelectItem value="three">Option Three</SelectItem>
                <SelectItem value="four">Option Four</SelectItem>
                <SelectItem value="five">Option Five</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* States */}
        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Select>
              <SelectTrigger className="w-[196px]">
                <SelectValue placeholder="Select Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Option One</SelectItem>
                <SelectItem value="two">Option Two</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="two">
              <SelectTrigger className="w-[196px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Option One</SelectItem>
                <SelectItem value="two">Option Two</SelectItem>
                <SelectItem value="three">Option Three</SelectItem>
                <SelectItem value="four">Option Four</SelectItem>
                <SelectItem value="five">Option Five</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="two" disabled>
              <SelectTrigger className="w-[196px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Option One</SelectItem>
                <SelectItem value="two">Option Two</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ── CHECKBOX ── */}
      <section className="flex flex-col gap-10">
        <h4>Checkbox</h4>

        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Checkbox id="cb-unchecked" />
              <Label htmlFor="cb-unchecked" className="text-[15px] text-foreground">Not Checked</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox id="cb-indeterminate" checked="indeterminate" />
              <Label htmlFor="cb-indeterminate" className="text-[15px] text-foreground">Indeterminate</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox id="cb-checked" defaultChecked />
              <Label htmlFor="cb-checked" className="text-[15px] text-foreground">Checked</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox id="cb-disabled" disabled />
              <Label htmlFor="cb-disabled" className="text-[15px] text-foreground">Disabled</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox id="cb-disabled-checked" disabled defaultChecked />
              <Label htmlFor="cb-disabled-checked" className="text-[15px] text-foreground">Disabled Checked</Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Invalid</h6>
          <div className="flex items-center gap-1.5">
            <Checkbox id="cb-invalid" aria-invalid />
            <Label htmlFor="cb-invalid" className="text-[15px] text-foreground">Accept terms</Label>
          </div>
        </div>
      </section>

      {/* ── RADIO ── */}
      <section className="flex flex-col gap-10">
        <h4>Radio</h4>

        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-col gap-3">
            <RadioGroup>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="unchecked" id="radio-unchecked" />
                <Label htmlFor="radio-unchecked" className="text-[15px] text-foreground">Not Checked</Label>
              </div>
            </RadioGroup>
            <RadioGroup defaultValue="checked">
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="checked" id="radio-checked" />
                <Label htmlFor="radio-checked" className="text-[15px] text-foreground">Checked</Label>
              </div>
            </RadioGroup>
            <RadioGroup disabled>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="disabled" id="radio-disabled" />
                <Label htmlFor="radio-disabled" className="text-[15px] text-foreground">Disabled</Label>
              </div>
            </RadioGroup>
            <RadioGroup defaultValue="disabled-checked" disabled>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="disabled-checked" id="radio-disabled-checked" />
                <Label htmlFor="radio-disabled-checked" className="text-[15px] text-foreground">Disabled Checked</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Group</h6>
          <RadioGroup defaultValue="one">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="one" id="radio-group-one" />
              <Label htmlFor="radio-group-one" className="text-[15px] text-foreground">Option One</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="two" id="radio-group-two" />
              <Label htmlFor="radio-group-two" className="text-[15px] text-foreground">Option Two</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="three" id="radio-group-three" />
              <Label htmlFor="radio-group-three" className="text-[15px] text-foreground">Option Three</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Invalid</h6>
          <RadioGroup>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="invalid" id="radio-invalid" aria-invalid />
              <Label htmlFor="radio-invalid" className="text-[15px] text-foreground">Accept terms</Label>
            </div>
          </RadioGroup>
        </div>
      </section>

      {/* ── SWITCH ── */}
      <section className="flex flex-col gap-10">
        <h4>Switch</h4>

        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Switch id="switch-unchecked" />
              <Label htmlFor="switch-unchecked" className="text-[15px] text-foreground">Not Checked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-checked" defaultChecked />
              <Label htmlFor="switch-checked" className="text-[15px] text-foreground">Checked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-disabled" disabled />
              <Label htmlFor="switch-disabled" className="text-[15px] text-foreground">Disabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-disabled-checked" disabled defaultChecked />
              <Label htmlFor="switch-disabled-checked" className="text-[15px] text-foreground">Disabled Checked</Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Invalid</h6>
          <div className="flex items-center gap-2">
            <Switch id="switch-invalid" aria-invalid />
            <Label htmlFor="switch-invalid" className="text-[15px] text-foreground">Accept terms</Label>
          </div>
        </div>
      </section>

      {/* ── FILE UPLOAD ── */}
      <section className="flex flex-col gap-10">
        <h4>File Upload</h4>

        <div className="flex flex-col gap-3">
          <h6>Single file</h6>
          <FileUploadDemo multiple={false} />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Multiple files</h6>
          <FileUploadDemo multiple={true} />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Disabled</h6>
          <FileUpload
            multiple
            files={[]}
            onFilesChange={() => {}}
            disabled
            title="Drop files here or click to upload"
            className="w-full max-w-[500px]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Invalid</h6>
          <FileUpload
            multiple
            files={[]}
            onFilesChange={() => {}}
            aria-invalid
            title="Drop files here or click to upload"
            className="w-full max-w-[500px]"
          />
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

      {/* ── TEXTAREA ── */}
      <section className="flex flex-col gap-10">
        <h4>Textarea</h4>

        {/* Sizes */}
        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-start gap-3">
            <Textarea size="sm" placeholder="Small" className="w-[200px]" />
            <Textarea size="default" placeholder="Default" className="w-[200px]" />
            <Textarea size="lg" placeholder="Large" className="w-[200px]" />
          </div>
        </div>

        {/* States */}
        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-wrap items-start gap-3">
            <Textarea placeholder="Default" className="w-[200px]" />
            <Textarea defaultValue="Filled value" className="w-[200px]" />
            <Textarea placeholder="Read only" readOnly className="w-[200px]" />
            <Textarea placeholder="Disabled" disabled className="w-[200px]" />
          </div>
        </div>

        {/* Validation */}
        <div className="flex flex-col gap-3">
          <h6>Validation</h6>
          <div className="flex flex-wrap items-start gap-3">
            <Textarea placeholder="Valid" isValid={true} className="w-[200px]" />
            <Textarea placeholder="Invalid" aria-invalid className="w-[200px]" />
          </div>
        </div>
      </section>

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
                <Badge variant={v} className="size-6 justify-center p-0 rounded-[4px] text-[13px] font-semibold">{i + 1}</Badge>
                <Badge variant={v} className="size-6 justify-center p-0 rounded-[4px] [&_svg]:size-4">{icon}</Badge>
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
                <Badge variant={v} skin="light" className="size-6 justify-center p-0 rounded-[4px] text-[13px] font-semibold">{i + 1}</Badge>
                <Badge variant={v} skin="light" className="size-6 justify-center p-0 rounded-[4px] [&_svg]:size-4">{icon}</Badge>
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

      {/* ── BREADCRUMB ── */}
      <section className="flex flex-col gap-10">
        <h4>Breadcrumb</h4>

        {/* Chevron */}
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

        {/* Slash */}
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

        {/* Check */}
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
    </div>
  );
}
