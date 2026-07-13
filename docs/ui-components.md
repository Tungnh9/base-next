# UI Components

Tất cả nằm trong `src/components/ui/`.

## Form Controls

| Component       | Mô tả                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| `input`         | Sizes sm/default/lg, icons trái/phải, floating label, validation state |
| `textarea`      | Sizes, validation state                                                |
| `select`        | Radix Select, sizes, validation state                                  |
| `checkbox`      | Colors: primary/secondary/success/danger/warning/info/dark             |
| `radio`         | RadioGroup với colors                                                  |
| `switch`        | Toggle với colors                                                      |
| `tag-input`     | Multi-tag input, variant: "select" \| "tag"                            |
| `file-upload`   | Drag & drop, single/multiple, preview                                  |
| `slider`        | Range slider, variants, ticks, labels, vertical orientation            |
| `input-group`   | InputGroup + InputGroupInput + InputAddon + InputGroupButton           |
| `custom-option` | Radio/checkbox option cards (horizontal/vertical/image)                |
| `form`          | Form wrapper (react-hook-form)                                         |
| `label`         | Form label                                                             |

## Buttons

| Component      | Mô tả                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `button`       | Variants: default/secondary/success/destructive/warning/info/dark/outline/ghost/link; sizes xs/sm/default/lg/icon |
| `button-group` | Grouped buttons, horizontal/vertical                                                                              |

## Display & Layout

| Component    | Mô tả                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------- |
| `card`       | CardHeader, CardTitle, CardDescription, CardContent, CardItem, CardFooter, CardImage      |
| `avatar`     | AvatarImage, AvatarFallback, AvatarGroup; sizes 26–72px; status: online/offline/busy/away |
| `badge`      | Variants; skin: filled/light/dot; sizes sm/md                                             |
| `progress`   | Variants; skin: solid/striped; stacked segments                                           |
| `carousel`   | Variants: slide-only/with-control/with-indicator/with-caption; autoplay                   |
| `separator`  | Divider ngang/dọc                                                                         |
| `skeleton`   | Loading placeholder                                                                       |
| `table`      | HTML table cơ bản                                                                         |
| `list-group` | List group                                                                                |

## Navigation

| Component    | Mô tả                                                  |
| ------------ | ------------------------------------------------------ |
| `breadcrumb` | Separators: chevron/slash/check                        |
| `pagination` | Previous/Next/Links/Ellipsis; sizes sm/default/lg      |
| `tabs`       | Tab navigation                                         |
| `accordion`  | Variants: default/border/advance; single/multiple mode |

## Overlay & Feedback

| Component           | Mô tả                                                     |
| ------------------- | --------------------------------------------------------- |
| `tooltip`           | Placements: top/right/bottom/left                         |
| `popover`           | PopoverTrigger, PopoverContent, PopoverTitle, PopoverBody |
| `dropdown-menu`     | Items, checkbox, radio, submenus, separators, shortcuts   |
| `dialog`            | Modal với DialogHeader/Body/Footer/Close                  |
| `alert`             | Variants; icon; closable                                  |
| `toast` + `toaster` | shadcn Toast (Radix) — dùng với `useToast()`              |
| `sonner`            | Sonner toast library wrapper                              |

## Khác

| Component      | Mô tả                                                                |
| -------------- | -------------------------------------------------------------------- |
| `date-picker`  | Calendar, RangeCalendar, MonthPicker, TimePicker, DatePicker popover |
| `data-table`   | TanStack Table với column sorting, row selection                     |
| `theme-toggle` | Dark/Light/System switcher                                           |

---

## Toast

### Sonner (simple)

```ts
import { toast } from "sonner"

toast.success("Đã lưu")
toast.error("Có lỗi xảy ra")

// Loading → Success pattern
const id = toast.loading("Đang xử lý...")
toast.success("Hoàn thành!", { id })
```

### useToast (rich)

```ts
import { toast } from "@/hooks/use-toast"

// Rich toast (không tự đóng, có icon trạng thái)
toast({
  type: "rich",
  variant: "success", // default | primary | success | danger | warning | info
  title: "Thành công!",
  description: "Dữ liệu đã được cập nhật.",
})

// Toast có action button
toast({
  type: "rich",
  variant: "danger",
  title: "Xóa mục này?",
  action: { label: "Hoàn tác", onClick: () => restore() },
})
```
