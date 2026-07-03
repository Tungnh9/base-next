"use client"

import { useState } from "react"
import { Lock, Mail, Check, X, Star, Gift, Folder, Rocket } from "lucide-react"
import { CustomOptionGroup, CustomOptionItem } from "@/components/ui/custom-option"
import { Input, FloatingLabelInput } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/ui/tag-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox, type CheckboxColor } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem, type RadioColor } from "@/components/ui/radio"
import { Switch, type SwitchColor } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"
import { Label } from "@/components/ui/label"
import { Slider, type SliderVariant } from "@/components/ui/slider"
import {
  InputGroup,
  InputGroupInput,
  InputAddon,
  InputGroupCheckbox,
  InputGroupRadio,
  InputGroupButton,
} from "@/components/ui/input-group"

function TagInputDemo({ variant, initialValues }: { variant: "select" | "tag"; initialValues: string[] }) {
  const [values, setValues] = useState(initialValues)
  const [inputValue, setInputValue] = useState("")
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
          e.preventDefault()
          setValues((prev) => [...prev, inputValue.trim()])
          setInputValue("")
        }
      }}
      className="w-[250px]"
    />
  )
}

function FileUploadDemo({ multiple }: { multiple: boolean }) {
  const [files, setFiles] = useState<File[]>([])
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
  )
}

const PLACEHOLDER_IMG = (color: string, label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="${color}"/><text x="100" y="80" font-family="sans-serif" font-size="16" fill="#fff" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  )

function CustomOptionDemo() {
  const [radioValue, setRadioValue] = useState("basic")
  const [radioImageValue, setRadioImageValue] = useState("img1")
  const [cbDiscount, setCbDiscount] = useState(true)
  const [cbBackup, setCbBackup] = useState(false)
  const [cbStarted, setCbStarted] = useState(true)
  const [cbImg, setCbImg] = useState(true)

  return (
    <section className="flex flex-col gap-10">
      <h4>Custom Option</h4>

      {/* Horizontal — Radio */}
      <div className="flex flex-col gap-3">
        <h6>Horizontal — Radio</h6>
        <CustomOptionGroup value={radioValue} onValueChange={setRadioValue} className="max-w-sm">
          <CustomOptionItem
            value="basic"
            label="Basic"
            badge="Free"
            description="Get 1 project with 1 teams members."
          />
          <CustomOptionItem
            value="pro"
            label="Pro"
            badge="$9/mo"
            description="Everything in Basic plus unlimited projects."
          />
          <CustomOptionItem
            value="enterprise"
            label="Enterprise"
            badge="Custom"
            description="Dedicated support and advanced security."
            disabled
          />
        </CustomOptionGroup>
      </div>

      {/* Horizontal — Checkbox */}
      <div className="flex flex-col gap-3">
        <h6>Horizontal — Checkbox</h6>
        <div className="flex flex-col gap-3 max-w-sm">
          <CustomOptionItem
            type="checkbox"
            label="Discount"
            badge="20%"
            description="wow Get 20% off on your next purchases!"
            checked={cbDiscount}
            onCheckedChange={setCbDiscount}
          />
          <CustomOptionItem
            type="checkbox"
            label="Newsletter"
            badge="Free"
            description="Get weekly tips delivered to your inbox."
            checked={cbBackup}
            onCheckedChange={setCbBackup}
          />
        </div>
      </div>

      {/* Vertical — Radio */}
      <div className="flex flex-col gap-3">
        <h6>Vertical — Radio</h6>
        <CustomOptionGroup value={radioValue} onValueChange={setRadioValue} className="grid grid-cols-3 max-w-lg">
          <CustomOptionItem
            value="basic"
            variant="vertical"
            icon={<Star />}
            label="Starter"
            description="For freelancers who work with multiple clients"
          />
          <CustomOptionItem
            value="pro"
            variant="vertical"
            icon={<Gift />}
            label="$0/mo"
            description="Rich landing pages & 100+ components"
          />
          <CustomOptionItem
            value="enterprise"
            variant="vertical"
            icon={<Rocket />}
            label="Enterprise"
            description="Whether you're new or you're a power user."
            disabled
          />
        </CustomOptionGroup>
      </div>

      {/* Vertical — Checkbox */}
      <div className="flex flex-col gap-3">
        <h6>Vertical — Checkbox</h6>
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          <CustomOptionItem
            type="checkbox"
            variant="vertical"
            icon={<Star />}
            label="Starter"
            description="For freelancers who work with multiple clients"
            checked={cbDiscount}
            onCheckedChange={setCbDiscount}
          />
          <CustomOptionItem
            type="checkbox"
            variant="vertical"
            icon={<Folder />}
            label="Backup"
            description="For freelancers who work with multiple clients"
            checked={cbBackup}
            onCheckedChange={setCbBackup}
          />
          <CustomOptionItem
            type="checkbox"
            variant="vertical"
            icon={<Rocket />}
            label="Getting Started"
            description="Whether you're new or you're a power user."
            checked={cbStarted}
            onCheckedChange={setCbStarted}
          />
        </div>
      </div>

      {/* Image — Radio */}
      <div className="flex flex-col gap-3">
        <h6>Image — Radio</h6>
        <CustomOptionGroup value={radioImageValue} onValueChange={setRadioImageValue} className="grid grid-cols-3 max-w-lg">
          <CustomOptionItem value="img1" variant="image" image={PLACEHOLDER_IMG("#7367F0", "Option 1")} />
          <CustomOptionItem value="img2" variant="image" image={PLACEHOLDER_IMG("#EA5455", "Option 2")} />
          <CustomOptionItem value="img3" variant="image" image={PLACEHOLDER_IMG("#28C76F", "Option 3")} disabled />
        </CustomOptionGroup>
      </div>

      {/* Image — Checkbox */}
      <div className="flex flex-col gap-3">
        <h6>Image — Checkbox</h6>
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          <CustomOptionItem
            type="checkbox"
            variant="image"
            image={PLACEHOLDER_IMG("#FF9F43", "Option A")}
            checked={cbImg}
            onCheckedChange={setCbImg}
          />
          <CustomOptionItem
            type="checkbox"
            variant="image"
            image={PLACEHOLDER_IMG("#00CFE8", "Option B")}
            checked={cbBackup}
            onCheckedChange={setCbBackup}
          />
          <CustomOptionItem
            type="checkbox"
            variant="image"
            image={PLACEHOLDER_IMG("#A8AAAE", "Disabled")}
            checked={false}
            onCheckedChange={() => {}}
            disabled
          />
        </div>
      </div>
    </section>
  )
}

export default function FormPage() {
  return (
    <div className="flex flex-col gap-16">
      <h1>Form Controls</h1>

      {/* ── INPUT ── */}
      <section className="flex flex-col gap-10">
        <h4>Input</h4>

        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input size="sm" placeholder="Small" className="w-[200px]" />
            <Input size="default" placeholder="Default" className="w-[200px]" />
            <Input size="lg" placeholder="Large" className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Default" className="w-[200px]" />
            <Input defaultValue="Filled value" className="w-[200px]" />
            <Input placeholder="Read only" readOnly className="w-[200px]" />
            <Input placeholder="Disabled" disabled className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Validation</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Valid" isValid={true} className="w-[200px]" />
            <Input placeholder="Invalid" aria-invalid className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Icons</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Email" startIcon={<Mail />} className="w-[200px]" />
            <Input placeholder="Password" type="password" startIcon={<Lock />} className="w-[200px]" />
            <Input placeholder="Valid" isValid={true} endIcon={<Check className="text-success" />} className="w-[200px]" />
            <Input placeholder="Invalid" aria-invalid endIcon={<X className="text-destructive" />} className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Sizes — With Icon</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Input size="sm" placeholder="Small" startIcon={<Lock />} className="w-[200px]" />
            <Input size="default" placeholder="Default" startIcon={<Lock />} className="w-[200px]" />
            <Input size="lg" placeholder="Large" startIcon={<Lock />} className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Floating Label</h6>
          <div className="flex flex-wrap items-start gap-4">
            <FloatingLabelInput label="Full Name" className="w-[220px]" />
            <FloatingLabelInput label="Email" helperText="We'll never share your email." className="w-[220px]" />
            <FloatingLabelInput label="Valid field" isValid helperText="Looks good!" className="w-[220px]" />
            <FloatingLabelInput label="Invalid field" aria-invalid helperText="This field is required." className="w-[220px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Multiple Select</h6>
          <TagInputDemo variant="select" initialValues={["Option 1", "Option 2"]} />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Tagify</h6>
          <TagInputDemo variant="tag" initialValues={["Option 1", "Option 2"]} />
        </div>
      </section>

      {/* ── TEXTAREA ── */}
      <section className="flex flex-col gap-10">
        <h4>Textarea</h4>

        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-start gap-3">
            <Textarea size="sm" placeholder="Small" className="w-[200px]" />
            <Textarea size="default" placeholder="Default" className="w-[200px]" />
            <Textarea size="lg" placeholder="Large" className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-wrap items-start gap-3">
            <Textarea placeholder="Default" className="w-[200px]" />
            <Textarea defaultValue="Filled value" className="w-[200px]" />
            <Textarea placeholder="Read only" readOnly className="w-[200px]" />
            <Textarea placeholder="Disabled" disabled className="w-[200px]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Validation</h6>
          <div className="flex flex-wrap items-start gap-3">
            <Textarea placeholder="Valid" isValid={true} className="w-[200px]" />
            <Textarea placeholder="Invalid" aria-invalid className="w-[200px]" />
          </div>
        </div>
      </section>

      {/* ── SELECT ── */}
      <section className="flex flex-col gap-10">
        <h4>Select</h4>

        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-wrap items-center gap-3">
            {(["sm", "default", "lg"] as const).map(size => (
              <Select key={size}>
                <SelectTrigger size={size} className="w-[196px]">
                  <SelectValue placeholder="Select Form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">Option One</SelectItem>
                  <SelectItem value="two">Option Two</SelectItem>
                  <SelectItem value="three">Option Three</SelectItem>
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>States</h6>
          <div className="flex flex-wrap items-center gap-3">
            <Select>
              <SelectTrigger className="w-[196px]">
                <SelectValue placeholder="Empty" />
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
          <h6>Colors</h6>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {(["primary", "secondary", "success", "danger", "warning", "info", "dark"] as CheckboxColor[]).map(color => (
              <div key={color} className="flex items-center gap-1.5">
                <Checkbox id={`cb-${color}`} defaultChecked color={color} />
                <Label htmlFor={`cb-${color}`} className="text-[15px] text-foreground capitalize">{color}</Label>
              </div>
            ))}
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
          <h6>Colors</h6>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {(["primary", "secondary", "success", "danger", "warning", "info", "dark"] as RadioColor[]).map(color => (
              <RadioGroup key={color} defaultValue="checked">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="checked" id={`radio-${color}`} color={color} />
                  <Label htmlFor={`radio-${color}`} className="text-[15px] text-foreground capitalize">{color}</Label>
                </div>
              </RadioGroup>
            ))}
          </div>
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
          <h6>Colors</h6>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {(["primary", "secondary", "success", "danger", "warning", "info", "dark"] as SwitchColor[]).map(color => (
              <div key={color} className="flex items-center gap-2">
                <Switch id={`switch-${color}`} defaultChecked color={color} />
                <Label htmlFor={`switch-${color}`} className="text-[15px] text-foreground capitalize">{color}</Label>
              </div>
            ))}
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

      {/* ── SLIDER ── */}
      <section className="flex flex-col gap-10">
        <h4>Slider</h4>

        {/* Color variants */}
        <div className="flex flex-col gap-3">
          <h6>Variants</h6>
          <div className="flex flex-col gap-6 max-w-lg">
            {(["default", "primary", "success", "danger", "warning", "info"] as SliderVariant[]).map(
              (variant) => (
                <div key={variant} className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground capitalize">{variant}</span>
                  <Slider variant={variant} defaultValue={[40]} />
                </div>
              )
            )}
          </div>
        </div>

        {/* Range (two thumbs) */}
        <div className="flex flex-col gap-3">
          <h6>Range</h6>
          <Slider defaultValue={[20, 80]} className="max-w-lg" />
        </div>

        {/* With value labels */}
        <div className="flex flex-col gap-3">
          <h6>With labels</h6>
          <Slider defaultValue={[20, 80]} showLabel className="max-w-lg" />
        </div>

        {/* With tick marks */}
        <div className="flex flex-col gap-3">
          <h6>With ticks</h6>
          <Slider defaultValue={[20, 80]} showTicks className="max-w-lg" />
        </div>

        {/* Labels + ticks */}
        <div className="flex flex-col gap-3">
          <h6>Labels &amp; ticks</h6>
          <Slider defaultValue={[20, 80]} showLabel showTicks className="max-w-lg" />
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-3">
          <h6>Sizes</h6>
          <div className="flex flex-col gap-4 max-w-lg">
            <Slider size="sm"      defaultValue={[50]} />
            <Slider size="default" defaultValue={[50]} />
            <Slider size="lg"      defaultValue={[50]} />
          </div>
        </div>

        {/* Disabled */}
        <div className="flex flex-col gap-3">
          <h6>Disabled</h6>
          <Slider defaultValue={[30, 70]} disabled className="max-w-lg" />
        </div>

        {/* Vertical */}
        <div className="flex flex-col gap-3">
          <h6>Vertical</h6>
          <div className="flex gap-10 items-start h-48">
            <Slider orientation="vertical" defaultValue={[20, 80]} />
            <Slider orientation="vertical" defaultValue={[20, 80]} showLabel />
            <Slider orientation="vertical" defaultValue={[20, 80]} showTicks />
            <Slider orientation="vertical" defaultValue={[20, 80]} showLabel showTicks />
          </div>
        </div>
      </section>

      {/* ── INPUT GROUP ── */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Input Group</h2>

        {/* Text addons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Text addons</p>
          <div className="grid gap-3 max-w-md">
            <InputGroup>
              <InputAddon>https://</InputAddon>
              <InputGroupInput placeholder="example.com" />
            </InputGroup>
            <InputGroup>
              <InputGroupInput placeholder="username" />
              <InputAddon>@example.com</InputAddon>
            </InputGroup>
            <InputGroup>
              <InputAddon>$</InputAddon>
              <InputGroupInput placeholder="0.00" type="number" />
              <InputAddon>USD</InputAddon>
            </InputGroup>
            <InputGroup>
              <InputAddon>From</InputAddon>
              <InputGroupInput placeholder="start" />
              <InputAddon>To</InputAddon>
              <InputGroupInput placeholder="end" />
            </InputGroup>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Sizes</p>
          <div className="grid gap-3 max-w-md">
            <InputGroup size="sm">
              <InputAddon>https://</InputAddon>
              <InputGroupInput placeholder="small" />
              <InputAddon>.com</InputAddon>
            </InputGroup>
            <InputGroup size="default">
              <InputAddon>https://</InputAddon>
              <InputGroupInput placeholder="default" />
              <InputAddon>.com</InputAddon>
            </InputGroup>
            <InputGroup size="lg">
              <InputAddon>https://</InputAddon>
              <InputGroupInput placeholder="large" />
              <InputAddon>.com</InputAddon>
            </InputGroup>
          </div>
        </div>

        {/* Checkbox addon */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Checkbox addon</p>
          <div className="grid gap-3 max-w-md">
            <InputGroup>
              <InputGroupCheckbox defaultChecked />
              <InputGroupInput placeholder="Checked by default" />
            </InputGroup>
            <InputGroup>
              <InputGroupCheckbox />
              <InputGroupInput placeholder="Unchecked" />
            </InputGroup>
            <InputGroup>
              <InputGroupCheckbox disabled defaultChecked />
              <InputGroupInput placeholder="Disabled" disabled />
            </InputGroup>
          </div>
        </div>

        {/* Radio addon */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Radio addon</p>
          <div className="grid gap-3 max-w-md">
            <RadioGroup defaultValue="a">
              <InputGroup>
                <InputGroupRadio value="a" />
                <InputGroupInput placeholder="Option A" />
              </InputGroup>
              <InputGroup>
                <InputGroupRadio value="b" />
                <InputGroupInput placeholder="Option B" />
              </InputGroup>
              <InputGroup>
                <InputGroupRadio value="c" disabled />
                <InputGroupInput placeholder="Disabled" disabled />
              </InputGroup>
            </RadioGroup>
          </div>
        </div>

        {/* Button addon */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Button addon</p>
          <div className="grid gap-3 max-w-md">
            <InputGroup>
              <InputGroupInput placeholder="Search…" />
              <InputGroupButton>Go</InputGroupButton>
            </InputGroup>
            <InputGroup>
              <InputGroupButton>Copy</InputGroupButton>
              <InputGroupInput placeholder="Value to copy" />
            </InputGroup>
            <InputGroup>
              <InputGroupButton>-</InputGroupButton>
              <InputGroupInput placeholder="0" type="number" className="text-center" />
              <InputGroupButton>+</InputGroupButton>
            </InputGroup>
          </div>
        </div>

        {/* Validation */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Validation</p>
          <div className="grid gap-3 max-w-md">
            <InputGroup>
              <InputAddon>$</InputAddon>
              <InputGroupInput
                placeholder="Invalid amount"
                aria-invalid="true"
                defaultValue="abc"
              />
              <InputAddon>USD</InputAddon>
            </InputGroup>
          </div>
        </div>
      </section>

      {/* ── CUSTOM OPTION ── */}
      <CustomOptionDemo />
    </div>
  )
}
