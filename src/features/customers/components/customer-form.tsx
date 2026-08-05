"use client"

import { useEffect, useState } from "react"
import { useForm, useWatch, Controller, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Phone, Mail, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEmployeeOptions } from "@/features/employees"
import { CustomerField, CustomerTextField } from "./customer-form-field"
import { CustomerAvatarField } from "./customer-avatar-field"
import {
  CUSTOMER_CLASSIFICATIONS,
  CUSTOMER_COUNTRIES,
  CUSTOMER_INDUSTRIES,
  CUSTOMER_STATUSES,
  NO_SELECTION,
  VIETNAM_PROVINCES,
} from "../constants"
import { createCreateCustomerSchema, type CreateCustomerFormValues } from "../schemas"
import type { Customer, CustomerCountry, VietnamProvince } from "../types"
import type { EmployeeOption } from "@/features/employees"

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSubmit: (values: CreateCustomerFormValues) => Promise<boolean>
}

const DEFAULT_VALUES: CreateCustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  classification: "corporation",
  industry: "finance-banking",
  status: "collaborating",
  shortName: "",
  taxCode: "",
  website: "",
  address: "",
  country: "vietnam",
  province: undefined,
  salesRepId: "",
  contractManagerId: "",
  representativeName: "",
  representativePosition: "",
  representativeMobile: "",
  representativeEmail: "",
  contactName: "",
  contactPosition: "",
  contactMobile: "",
  contactEmail: "",
  mediaContactName: "",
  mediaContactPosition: "",
  mediaContactMobile: "",
  mediaContactEmail: "",
  avatarFileName: undefined,
  notes: "",
  review: "",
}

// Explicit field list (not a spread of `customer`) so id/code/createdAt/
// avatarUrl — none of which are form fields — can't leak into the form
// state. Optional text fields map `?? ""` so RHF sees a string and isDirty
// compares consistently once the user starts typing.
function toFormValues(customer: Customer): CreateCustomerFormValues {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    classification: customer.classification,
    industry: customer.industry,
    status: customer.status,
    shortName: customer.shortName ?? "",
    taxCode: customer.taxCode ?? "",
    website: customer.website ?? "",
    address: customer.address ?? "",
    country: customer.country ?? "vietnam",
    province: customer.province,
    salesRepId: customer.salesRepId ?? "",
    contractManagerId: customer.contractManagerId ?? "",
    representativeName: customer.representativeName ?? "",
    representativePosition: customer.representativePosition ?? "",
    representativeMobile: customer.representativeMobile ?? "",
    representativeEmail: customer.representativeEmail ?? "",
    contactName: customer.contactName ?? "",
    contactPosition: customer.contactPosition ?? "",
    contactMobile: customer.contactMobile ?? "",
    contactEmail: customer.contactEmail ?? "",
    mediaContactName: customer.mediaContactName ?? "",
    mediaContactPosition: customer.mediaContactPosition ?? "",
    mediaContactMobile: customer.mediaContactMobile ?? "",
    mediaContactEmail: customer.mediaContactEmail ?? "",
    avatarFileName: customer.avatarFileName,
    notes: customer.notes ?? "",
    review: customer.review ?? "",
  }
}

// NVKD/QLHĐ picker — Controller + useEmployeeOptions(), shared by both
// (required) assignee fields. No "Không chọn" item — a real employee must be
// picked. Disabled while loading; a stored id whose employee no longer
// exists renders as "Nhân viên #id" instead of a blank trigger.
function EmployeeSelectField({
  control,
  name,
  label,
  error,
  options,
  isLoading,
}: {
  control: Control<CreateCustomerFormValues>
  name: "salesRepId" | "contractManagerId"
  label: string
  error?: string
  options: EmployeeOption[]
  isLoading: boolean
}) {
  const t = useTranslations("customers")
  const tCommon = useTranslations("common")
  const tEmployees = useTranslations("employees")

  return (
    <CustomerField label={label} error={error} required>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const isOrphan = Boolean(field.value) && !options.some((o) => o.id === field.value)
          return (
            <Select
              value={field.value || undefined}
              onValueChange={(v) => field.onChange(v)}
              disabled={isLoading}
            >
              <SelectTrigger
                className="w-full"
                aria-label={label}
                aria-invalid={Boolean(error)}
                aria-required="true"
              >
                <SelectValue
                  placeholder={isLoading ? tCommon("loading") : t("form.assigneePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {isOrphan && (
                  <SelectItem value={field.value}>
                    {t("form.assigneeUnknown", { id: field.value })}
                  </SelectItem>
                )}
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                    <span className="text-muted-foreground">
                      {` · ${tEmployees(`department.${option.department}`)}`}
                    </span>
                  </SelectItem>
                ))}
                {!isLoading && options.length === 0 && (
                  <p className="text-muted-foreground px-2 py-1.5 text-xs">
                    {t("form.assigneeEmpty")}
                  </p>
                )}
              </SelectContent>
            </Select>
          )
        }}
      />
    </CustomerField>
  )
}

export function CustomerForm({ open, onOpenChange, customer, onSubmit }: CustomerFormProps) {
  const t = useTranslations("customers")
  const tErrors = useTranslations("customers.errors")
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const { options: employeeOptions, isLoading: employeeOptionsLoading } = useEmployeeOptions()

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCreateCustomerSchema(tErrors)),
    defaultValues: DEFAULT_VALUES,
  })

  // useWatch (not the useForm()-returned watch()) — the latter is a plain
  // function the React Compiler can't safely memoize.
  const country = useWatch({ control, name: "country" })
  const avatarFileName = useWatch({ control, name: "avatarFileName" })
  const isVietnam = country === "vietnam"

  useEffect(() => {
    if (open) {
      reset(customer ? toFormValues(customer) : DEFAULT_VALUES)
    }
  }, [open, customer, reset])

  async function onValid(values: CreateCustomerFormValues) {
    const ok = await onSubmit(values)
    if (ok) onOpenChange(false)
  }

  // Radix calls onOpenChange for every close path — Cancel button, Esc,
  // overlay click, and the built-in X button — so intercepting here (rather
  // than only the Cancel button's onClick) is the only way to catch all of
  // them when there are unsaved changes.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDirty) {
      setShowDiscardConfirm(true)
      return
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* max-w override must include the sm: prefix — base DialogContent carries
          sm:max-w-[500px] and twMerge treats it as a separate class group
          (same override pattern as editor/toolbar/chart-dialog.tsx). */}
      <DialogContent className="flex max-h-[90vh] max-w-[min(1024px,calc(100vw-2rem))] flex-col overflow-hidden sm:max-w-[min(1024px,calc(100vw-2rem))]">
        <DialogHeader className="border-border shrink-0 border-b py-4">
          <DialogTitle>{customer ? t("form.titleEdit") : t("form.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex min-h-0 flex-1 flex-col">
          {/* Only this region scrolls — header/footer stay pinned, which
              matters at ~30 fields where the submit button would otherwise
              be a long scroll away. */}
          <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 py-5">
            <section className="flex flex-col gap-4">
              <h3 className="text-foreground text-sm font-semibold">{t("form.sectionGeneral")}</h3>
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <CustomerField id="code" label={t("form.code")}>
                  <Input
                    id="code"
                    readOnly
                    tabIndex={-1}
                    value={customer?.code ?? ""}
                    placeholder={t("form.codeAutoPlaceholder")}
                    title={!customer ? t("form.codeAutoHint") : undefined}
                  />
                </CustomerField>

                <CustomerTextField
                  id="name"
                  label={t("form.name")}
                  placeholder={t("form.namePlaceholder")}
                  error={errors.name?.message}
                  required
                  {...register("name")}
                />

                <CustomerTextField
                  id="shortName"
                  label={t("form.shortName")}
                  placeholder={t("form.shortNamePlaceholder")}
                  error={errors.shortName?.message}
                  required
                  {...register("shortName")}
                />

                <CustomerTextField
                  id="company"
                  label={t("form.company")}
                  placeholder={t("form.companyPlaceholder")}
                  error={errors.company?.message}
                  required
                  {...register("company")}
                />

                <CustomerField label={t("form.industry")} error={errors.industry?.message} required>
                  <Controller
                    control={control}
                    name="industry"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-full"
                          aria-label={t("form.industry")}
                          aria-required="true"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {t(`industry.${industry}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </CustomerField>

                <CustomerField
                  label={t("form.classification")}
                  error={errors.classification?.message}
                  required
                >
                  <Controller
                    control={control}
                    name="classification"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-full"
                          aria-label={t("form.classification")}
                          aria-required="true"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_CLASSIFICATIONS.map((classification) => (
                            <SelectItem key={classification} value={classification}>
                              {t(`classification.${classification}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </CustomerField>

                <EmployeeSelectField
                  control={control}
                  name="salesRepId"
                  label={t("form.salesRep")}
                  error={errors.salesRepId?.message}
                  options={employeeOptions}
                  isLoading={employeeOptionsLoading}
                />

                <EmployeeSelectField
                  control={control}
                  name="contractManagerId"
                  label={t("form.contractManager")}
                  error={errors.contractManagerId?.message}
                  options={employeeOptions}
                  isLoading={employeeOptionsLoading}
                />

                <CustomerField label={t("form.status")} error={errors.status?.message} required>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-full"
                          aria-label={t("form.status")}
                          aria-required="true"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(`status.${status}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </CustomerField>

                <CustomerTextField
                  id="taxCode"
                  label={t("form.taxCode")}
                  placeholder={t("form.taxCodePlaceholder")}
                  error={errors.taxCode?.message}
                  required
                  {...register("taxCode")}
                />

                <CustomerTextField
                  id="phone"
                  label={t("form.phone")}
                  placeholder={t("form.phonePlaceholder")}
                  error={errors.phone?.message}
                  startIcon={<Phone className="size-4" />}
                  required
                  {...register("phone")}
                />

                <CustomerTextField
                  id="email"
                  type="email"
                  label={t("form.email")}
                  placeholder={t("form.emailPlaceholder")}
                  error={errors.email?.message}
                  startIcon={<Mail className="size-4" />}
                  required
                  {...register("email")}
                />

                <CustomerTextField
                  id="website"
                  label={t("form.website")}
                  placeholder={t("form.websitePlaceholder")}
                  error={errors.website?.message}
                  startIcon={<Globe className="size-4" />}
                  {...register("website")}
                />

                <CustomerTextField
                  id="address"
                  label={t("form.address")}
                  placeholder={t("form.addressPlaceholder")}
                  error={errors.address?.message}
                  className="sm:col-span-1 lg:col-span-2"
                  {...register("address")}
                />

                {/* Quốc gia/Tỉnh thành share their own 2-col strip spanning
                    the full row, instead of each just taking one of the
                    outer grid's 3 tracks and leaving the last one empty. */}
                <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2 lg:col-span-3">
                  <CustomerField label={t("form.country")} error={errors.country?.message}>
                    <Controller
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? NO_SELECTION}
                          onValueChange={(v) => {
                            const next = v === NO_SELECTION ? undefined : (v as CustomerCountry)
                            field.onChange(next)
                            // Tỉnh thành only exists inside Vietnam — leaving
                            // a stale province behind would submit e.g.
                            // { country: "japan", province: "ha-noi" }.
                            if (next !== "vietnam") {
                              setValue("province", undefined, { shouldDirty: true })
                            }
                          }}
                        >
                          <SelectTrigger className="w-full" aria-label={t("form.country")}>
                            <SelectValue placeholder={t("form.countryPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NO_SELECTION}>{t("form.countryNone")}</SelectItem>
                            {CUSTOMER_COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {t(`country.${c}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </CustomerField>

                  <CustomerField label={t("form.province")} error={errors.province?.message}>
                    <Controller
                      control={control}
                      name="province"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? NO_SELECTION}
                          onValueChange={(v) =>
                            field.onChange(v === NO_SELECTION ? undefined : (v as VietnamProvince))
                          }
                          disabled={!isVietnam}
                        >
                          <SelectTrigger className="w-full" aria-label={t("form.province")}>
                            <SelectValue
                              placeholder={
                                isVietnam
                                  ? t("form.provincePlaceholder")
                                  : t("form.provinceNotApplicable")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-[320px]">
                            <SelectItem value={NO_SELECTION}>{t("form.provinceNone")}</SelectItem>
                            {VIETNAM_PROVINCES.map((province) => (
                              <SelectItem key={province} value={province}>
                                {t(`province.${province}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </CustomerField>
                </div>
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
              <h3 className="text-foreground text-sm font-semibold">{t("form.sectionContacts")}</h3>
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                <CustomerTextField
                  id="representativeName"
                  label={t("form.representativeName")}
                  placeholder={t("form.personNamePlaceholder")}
                  error={errors.representativeName?.message}
                  {...register("representativeName")}
                />
                <CustomerTextField
                  id="contactName"
                  label={t("form.contactName")}
                  placeholder={t("form.personNamePlaceholder")}
                  error={errors.contactName?.message}
                  {...register("contactName")}
                />
                <CustomerTextField
                  id="mediaContactName"
                  label={t("form.mediaContactName")}
                  placeholder={t("form.personNamePlaceholder")}
                  error={errors.mediaContactName?.message}
                  {...register("mediaContactName")}
                />

                <CustomerTextField
                  id="representativePosition"
                  label={t("form.representativePosition")}
                  placeholder={t("form.positionPlaceholder")}
                  error={errors.representativePosition?.message}
                  {...register("representativePosition")}
                />
                <CustomerTextField
                  id="contactPosition"
                  label={t("form.contactPosition")}
                  placeholder={t("form.positionPlaceholder")}
                  error={errors.contactPosition?.message}
                  {...register("contactPosition")}
                />
                <CustomerTextField
                  id="mediaContactPosition"
                  label={t("form.mediaContactPosition")}
                  placeholder={t("form.positionPlaceholder")}
                  error={errors.mediaContactPosition?.message}
                  {...register("mediaContactPosition")}
                />

                <CustomerTextField
                  id="representativeMobile"
                  label={t("form.representativeMobile")}
                  placeholder={t("form.mobilePlaceholder")}
                  error={errors.representativeMobile?.message}
                  startIcon={<Phone className="size-4" />}
                  {...register("representativeMobile")}
                />
                <CustomerTextField
                  id="contactMobile"
                  label={t("form.contactMobile")}
                  placeholder={t("form.mobilePlaceholder")}
                  error={errors.contactMobile?.message}
                  startIcon={<Phone className="size-4" />}
                  {...register("contactMobile")}
                />
                <CustomerTextField
                  id="mediaContactMobile"
                  label={t("form.mediaContactMobile")}
                  placeholder={t("form.mobilePlaceholder")}
                  error={errors.mediaContactMobile?.message}
                  startIcon={<Phone className="size-4" />}
                  {...register("mediaContactMobile")}
                />

                <CustomerTextField
                  id="representativeEmail"
                  type="email"
                  label={t("form.representativeEmail")}
                  placeholder={t("form.contactEmailPlaceholder")}
                  error={errors.representativeEmail?.message}
                  startIcon={<Mail className="size-4" />}
                  {...register("representativeEmail")}
                />
                <CustomerTextField
                  id="contactEmail"
                  type="email"
                  label={t("form.contactEmail")}
                  placeholder={t("form.contactEmailPlaceholder")}
                  error={errors.contactEmail?.message}
                  startIcon={<Mail className="size-4" />}
                  {...register("contactEmail")}
                />
                <CustomerTextField
                  id="mediaContactEmail"
                  type="email"
                  label={t("form.mediaContactEmail")}
                  placeholder={t("form.contactEmailPlaceholder")}
                  error={errors.mediaContactEmail?.message}
                  startIcon={<Mail className="size-4" />}
                  {...register("mediaContactEmail")}
                />
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
              <h3 className="text-foreground text-sm font-semibold">{t("form.sectionMedia")}</h3>
              <CustomerAvatarField
                value={avatarFileName}
                onChange={(fileName) => setValue("avatarFileName", fileName, { shouldDirty: true })}
              />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <CustomerField id="notes" label={t("form.notes")} error={errors.notes?.message}>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder={t("form.notesPlaceholder")}
                    {...register("notes")}
                  />
                </CustomerField>
                <CustomerField id="review" label={t("form.review")} error={errors.review?.message}>
                  <Textarea
                    id="review"
                    rows={4}
                    placeholder={t("form.reviewPlaceholder")}
                    {...register("review")}
                  />
                </CustomerField>
              </div>
            </section>
          </div>

          <div className="border-border flex shrink-0 justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("form.discardTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("form.discardDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("form.discardCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardConfirm(false)
                onOpenChange(false)
              }}
            >
              {t("form.discardConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
