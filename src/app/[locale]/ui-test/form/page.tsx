"use client"

import { useState } from "react"
import { Lock, Mail, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/ui/tag-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"
import { Label } from "@/components/ui/label"

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
    </div>
  )
}
