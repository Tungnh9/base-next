"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createAddUserSchema } from "../schemas"
import type { AddUserInput, Role, SystemUser } from "../types"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

interface UserListCardProps {
  users: SystemUser[]
  roles: Role[]
  onAddUser: (input: AddUserInput) => Promise<boolean>
  onRemoveUser: (userId: string) => Promise<boolean>
}

function UserListCard({ users, roles, onAddUser, onRemoveUser }: UserListCardProps) {
  const t = useTranslations("settings.users")
  const tErrors = useTranslations("settings.users.dialog.errors")
  const tCommon = useTranslations("common")
  const [addOpen, setAddOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<SystemUser | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const roleName = (id: string) => roles.find((role) => role.id === id)?.name ?? id

  const resetForm = () => {
    setName("")
    setEmail("")
    setRoleId(roles[0]?.id ?? "")
    setFieldErrors({})
  }

  const handleAdd = async () => {
    const parsed = createAddUserSchema(tErrors).safeParse({ name, email, roleId })
    if (!parsed.success) {
      setFieldErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])))
      return
    }
    setFieldErrors({})
    const success = await onAddUser(parsed.data)
    if (success) {
      resetForm()
      setAddOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{t("cardTitle")}</CardTitle>
        <Button type="button" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          {t("addUser")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table hoverable>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.user")}</TableHead>
              <TableHead>{t("columns.role")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size={32}>
                      <AvatarFallback color="primary" skin="light">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-medium">{user.name}</p>
                      <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" skin="light">
                    {roleName(user.roleId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "success" : "danger"} skin="light">
                    {t(`status.${user.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={tCommon("delete")}
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(user)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-sm font-medium">{t("dialog.name")}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                isValid={!fieldErrors.name}
              />
              {fieldErrors.name && <p className="text-destructive text-xs">{fieldErrors.name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-sm font-medium">{t("dialog.email")}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isValid={!fieldErrors.email}
              />
              {fieldErrors.email && <p className="text-destructive text-xs">{fieldErrors.email}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-sm font-medium">{t("dialog.role")}</label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              {t("dialog.cancel")}
            </Button>
            <Button type="button" onClick={handleAdd}>
              {t("dialog.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && t("confirmDelete", { name: pendingDelete.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) onRemoveUser(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export { UserListCard }
