import { mockApi, mockApiError } from "@/lib/mock"
import type {
  AddUserInput,
  NotificationSetting,
  PermissionAction,
  PermissionModuleKey,
  Role,
  SystemUser,
  WorkflowStage,
} from "./types"

// ─── Workflow stages ────────────────────────────────────────────────────────
// key/order mirror nav.sectionSalesProcess in src/config/nav.ts 1:1 — stage
// display names resolve through useTranslations("nav")(stage.key), never a
// separate hardcoded string here.

export const MOCK_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "stage-sales-opportunities",
    key: "salesOpportunities",
    order: 1,
    enabled: true,
    states: [
      { id: "s1-1", name: "Đàm phán", color: "warning" },
      { id: "s1-2", name: "Cần duyệt", color: "info" },
      { id: "s1-3", name: "Đã duyệt", color: "success" },
      { id: "s1-4", name: "Từ chối", color: "danger" },
      { id: "s1-5", name: "Chốt", color: "primary" },
    ],
    actions: [
      { id: "a1-1", label: "Lưu", type: "primary", targetStateId: "s1-1" },
      { id: "a1-2", label: "Gửi duyệt", type: "secondary", targetStateId: "s1-2" },
      { id: "a1-3", label: "Duyệt", type: "success", targetStateId: "s1-3" },
      { id: "a1-4", label: "Từ chối", type: "danger", targetStateId: "s1-4" },
      { id: "a1-5", label: "Chuyển QLHĐ", type: "secondary", targetStateId: "s1-5" },
    ],
  },
  {
    id: "stage-input-records",
    key: "inputRecords",
    order: 2,
    enabled: true,
    states: [
      { id: "s2-1", name: "Soạn thảo", color: "secondary" },
      { id: "s2-2", name: "Trình ký", color: "info" },
      { id: "s2-3", name: "Đã ký", color: "success" },
      { id: "s2-4", name: "Từ chối", color: "danger" },
      { id: "s2-5", name: "Lưu trữ", color: "dark" },
    ],
    actions: [
      { id: "a2-1", label: "Lưu nháp", type: "primary", targetStateId: "s2-1" },
      { id: "a2-2", label: "Trình ký", type: "secondary", targetStateId: "s2-2" },
      { id: "a2-3", label: "Từ chối", type: "danger", targetStateId: "s2-4" },
    ],
  },
  {
    id: "stage-booking-deployment",
    key: "bookingDeployment",
    order: 3,
    enabled: true,
    states: [
      { id: "s3-1", name: "Chờ triển khai", color: "secondary" },
      { id: "s3-2", name: "Đang triển khai", color: "info" },
      { id: "s3-3", name: "Hoàn thành", color: "success" },
      { id: "s3-4", name: "Huỷ", color: "danger" },
    ],
    actions: [
      { id: "a3-1", label: "Bắt đầu", type: "primary", targetStateId: "s3-2" },
      { id: "a3-2", label: "Hoàn tất", type: "success", targetStateId: "s3-3" },
      { id: "a3-3", label: "Huỷ", type: "danger", targetStateId: "s3-4" },
    ],
  },
  {
    id: "stage-revenue",
    key: "revenue",
    order: 4,
    enabled: true,
    states: [
      { id: "s4-1", name: "Chưa ghi nhận", color: "secondary" },
      { id: "s4-2", name: "Đã ghi nhận", color: "success" },
    ],
    actions: [{ id: "a4-1", label: "Ghi nhận", type: "primary", targetStateId: "s4-2" }],
  },
  {
    id: "stage-acceptance-liquidation",
    key: "acceptanceLiquidation",
    order: 5,
    enabled: true,
    states: [
      { id: "s5-1", name: "Chờ nghiệm thu", color: "secondary" },
      { id: "s5-2", name: "Đang nghiệm thu", color: "info" },
      { id: "s5-3", name: "Đạt", color: "success" },
      { id: "s5-4", name: "Không đạt", color: "danger" },
    ],
    actions: [
      { id: "a5-1", label: "Bắt đầu", type: "secondary", targetStateId: "s5-2" },
      { id: "a5-2", label: "Xác nhận đạt", type: "success", targetStateId: "s5-3" },
      { id: "a5-3", label: "Không đạt", type: "danger", targetStateId: "s5-4" },
    ],
  },
  {
    id: "stage-payment-collection",
    key: "paymentCollection",
    order: 6,
    enabled: true,
    states: [
      { id: "s6-1", name: "Chưa thu", color: "secondary" },
      { id: "s6-2", name: "Đã thu", color: "success" },
    ],
    actions: [{ id: "a6-1", label: "Xác nhận thu", type: "primary", targetStateId: "s6-2" }],
  },
  {
    id: "stage-invoices",
    key: "invoices",
    order: 7,
    enabled: false,
    states: [
      { id: "s7-1", name: "Chưa xuất", color: "secondary" },
      { id: "s7-2", name: "Đã xuất", color: "success" },
    ],
    actions: [{ id: "a7-1", label: "Xuất hoá đơn", type: "primary", targetStateId: "s7-2" }],
  },
]

// ─── Notifications ──────────────────────────────────────────────────────────

export const MOCK_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { id: "notif-payment-due", labelKey: "paymentDueReminder", enabled: true },
  { id: "notif-budget-overrun", labelKey: "budgetOverrunWarning", enabled: true },
  { id: "notif-acceptance-reminder", labelKey: "acceptanceReminder", enabled: true },
  { id: "notif-invoice-auto-email", labelKey: "invoiceAutoEmail", enabled: true },
]

// ─── Users & roles ──────────────────────────────────────────────────────────

const FULL_ACCESS = { view: true, create: true, edit: true, delete: true }
const NO_ACCESS = { view: false, create: false, edit: false, delete: false }

export const MOCK_ROLES: Role[] = [
  {
    id: "role-admin",
    name: "Admin",
    permissions: {
      customers: FULL_ACCESS,
      employees: FULL_ACCESS,
      salesOpportunities: FULL_ACCESS,
      invoices: FULL_ACCESS,
      settings: FULL_ACCESS,
    },
  },
  {
    id: "role-manager",
    name: "Quản lý",
    permissions: {
      customers: { view: true, create: true, edit: true, delete: false },
      employees: { view: true, create: false, edit: false, delete: false },
      salesOpportunities: { view: true, create: true, edit: true, delete: false },
      invoices: { view: true, create: true, edit: false, delete: false },
      settings: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: "role-staff",
    name: "Nhân viên",
    permissions: {
      customers: { view: true, create: true, edit: false, delete: false },
      employees: NO_ACCESS,
      salesOpportunities: { view: true, create: true, edit: false, delete: false },
      invoices: { view: true, create: false, edit: false, delete: false },
      settings: NO_ACCESS,
    },
  },
]

export const MOCK_USERS: SystemUser[] = [
  {
    id: "user-1",
    name: "Nguyễn Văn A",
    email: "admin@company.vn",
    roleId: "role-admin",
    status: "active",
  },
  {
    id: "user-2",
    name: "Trần Thị B",
    email: "manager@company.vn",
    roleId: "role-manager",
    status: "active",
  },
  {
    id: "user-3",
    name: "Lê Văn C",
    email: "staff1@company.vn",
    roleId: "role-staff",
    status: "active",
  },
  {
    id: "user-4",
    name: "Phạm Thị D",
    email: "staff2@company.vn",
    roleId: "role-staff",
    status: "locked",
  },
  {
    id: "user-5",
    name: "Hoàng Văn E",
    email: "staff3@company.vn",
    roleId: "role-staff",
    status: "active",
  },
]

// ─── Mutable in-memory mock backend ────────────────────────────────────────
// Mirrors the employees/customers mock-data pattern: module-level mutable
// state that simulates server-side persistence across requests within the
// same server process (mock mode only — see src/lib/mock.ts, USE_MOCK_API).
// The MOCK_* consts above are the seed data these start from.

let workflowStages: WorkflowStage[] = MOCK_WORKFLOW_STAGES
let users: SystemUser[] = MOCK_USERS
let roles: Role[] = MOCK_ROLES

let userIdCounter = users.length + 1
let roleIdCounter = roles.length + 1

const EMPTY_MODULE_PERMISSIONS = { view: false, create: false, edit: false, delete: false }

export const settingsMockApi = {
  getWorkflowConfig: () => mockApi<WorkflowStage[]>(workflowStages),

  saveWorkflowConfig: (stages: WorkflowStage[]) => {
    workflowStages = stages
    return mockApi<WorkflowStage[]>(workflowStages)
  },

  getUserPermissionsData: () => mockApi<{ users: SystemUser[]; roles: Role[] }>({ users, roles }),

  addUser: (input: AddUserInput) => {
    const roleExists = roles.some((r) => r.id === input.roleId)
    if (!roleExists) {
      return mockApiError({ message: "Role not found", code: "NOT_FOUND", status: 404 })
    }
    const next: SystemUser = {
      id: `user-${userIdCounter++}`,
      name: input.name,
      email: input.email,
      roleId: input.roleId,
      status: "active",
    }
    users = [...users, next]
    return mockApi<SystemUser>(next)
  },

  removeUser: (userId: string) => {
    const found = users.some((u) => u.id === userId)
    if (!found) return mockApiError({ message: "User not found", code: "NOT_FOUND", status: 404 })
    users = users.filter((u) => u.id !== userId)
    return mockApi<void>(undefined as void)
  },

  addRole: (defaultName: string) => {
    const next: Role = {
      id: `role-${roleIdCounter++}`,
      name: defaultName,
      permissions: {
        customers: { ...EMPTY_MODULE_PERMISSIONS },
        employees: { ...EMPTY_MODULE_PERMISSIONS },
        salesOpportunities: { ...EMPTY_MODULE_PERMISSIONS },
        invoices: { ...EMPTY_MODULE_PERMISSIONS },
        settings: { ...EMPTY_MODULE_PERMISSIONS },
      },
    }
    roles = [...roles, next]
    return mockApi<Role>(next)
  },

  togglePermission: (roleId: string, moduleKey: PermissionModuleKey, action: PermissionAction) => {
    const role = roles.find((r) => r.id === roleId)
    if (!role) return mockApiError({ message: "Role not found", code: "NOT_FOUND", status: 404 })
    const updated: Role = {
      ...role,
      permissions: {
        ...role.permissions,
        [moduleKey]: {
          ...role.permissions[moduleKey],
          [action]: !role.permissions[moduleKey][action],
        },
      },
    }
    roles = roles.map((r) => (r.id === roleId ? updated : r))
    return mockApi<Role>(updated)
  },
}
