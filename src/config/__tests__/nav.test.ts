import { describe, it, expect } from "vitest"
import { createNavConfig, NAV_ITEMS, NAV } from "../nav"
import { ROUTES } from "@/lib/constants"

describe("createNavConfig", () => {
  it("returns the expected 5-section shape with correct item counts", () => {
    const config = createNavConfig()

    expect(config).toHaveLength(5)
    expect(config.map((section) => section.title)).toEqual([
      "nav.sectionOverview",
      "nav.sectionSalesProcess",
      "nav.sectionInventoryReports",
      "nav.sectionCatalog",
      "nav.sectionSystem",
    ])
    expect(config.map((section) => section.items.length)).toEqual([1, 7, 3, 3, 2])
  })

  it("gives the Dashboard item the dashboard route, enabled, and no requiredRole", () => {
    const [overviewSection] = createNavConfig()
    const dashboardItem = overviewSection.items[0]

    expect(dashboardItem.href).toBe(ROUTES.dashboard)
    expect(dashboardItem.requiredRole).toBeUndefined()
    expect(dashboardItem.disabled).toBeFalsy()
  })

  it("keeps Sales Opportunities enabled and marks the rest of Sales Process as disabled", () => {
    const [, salesSection] = createNavConfig()
    const expectedRoutes = [
      ROUTES.salesOpportunities,
      ROUTES.inputRecords,
      ROUTES.bookingDeployment,
      ROUTES.revenue,
      ROUTES.acceptanceLiquidation,
      ROUTES.paymentCollection,
      ROUTES.invoices,
    ]

    expect(salesSection.items.map((item) => item.href)).toEqual(expectedRoutes)
    const [opportunitiesItem, ...restOfSalesSection] = salesSection.items
    expect(opportunitiesItem.disabled).toBeFalsy()
    expect(restOfSalesSection.every((item) => item.disabled === true)).toBe(true)
  })

  it("marks every item in the Inventory & Reports section as disabled with the correct routes", () => {
    const [, , inventorySection] = createNavConfig()
    const expectedRoutes = [
      ROUTES.locationInspection,
      ROUTES.locationPerformance,
      ROUTES.periodicReports,
    ]

    expect(inventorySection.items.map((item) => item.href)).toEqual(expectedRoutes)
    expect(inventorySection.items.every((item) => item.disabled === true)).toBe(true)
  })

  it("keeps Customers enabled and marks Contracts/Document Archive as disabled in Catalog", () => {
    const [, , , catalogSection] = createNavConfig()
    const customersItem = catalogSection.items.find((item) => item.label === "nav.customers")
    const contractsItem = catalogSection.items.find((item) => item.label === "nav.contracts")
    const documentArchiveItem = catalogSection.items.find(
      (item) => item.label === "nav.documentArchive"
    )

    expect(customersItem?.href).toBe(ROUTES.customers)
    expect(customersItem?.requiredRole).toBeUndefined()
    expect(customersItem?.disabled).toBeFalsy()

    expect(contractsItem?.href).toBe(ROUTES.contracts)
    expect(contractsItem?.disabled).toBe(true)

    expect(documentArchiveItem?.href).toBe(ROUTES.documentArchive)
    expect(documentArchiveItem?.disabled).toBe(true)
  })

  it("marks Settings as disabled and keeps Employees admin-gated and enabled in System", () => {
    const [, , , , systemSection] = createNavConfig()
    const settingsItem = systemSection.items.find((item) => item.label === "nav.settings")
    const employeesItem = systemSection.items.find((item) => item.label === "nav.employees")

    expect(settingsItem?.href).toBe(ROUTES.settings)
    expect(settingsItem?.disabled).toBe(true)

    expect(employeesItem?.href).toBe(ROUTES.employees)
    expect(employeesItem?.requiredRole).toBe("admin")
    expect(employeesItem?.disabled).toBeFalsy()
  })

  it("has exactly 12 disabled items and exactly 4 enabled items", () => {
    const allItems = createNavConfig().flatMap((section) => section.items)
    const disabledItems = allItems.filter((item) => item.disabled === true)
    const enabledItems = allItems.filter((item) => !item.disabled)

    expect(disabledItems).toHaveLength(12)
    expect(enabledItems.map((item) => item.label)).toEqual([
      "nav.dashboard",
      "nav.salesOpportunities",
      "nav.customers",
      "nav.employees",
    ])
  })

  it("returns a fresh array on every call (not a shared reference)", () => {
    expect(createNavConfig()).not.toBe(createNavConfig())
    expect(createNavConfig()).toEqual(createNavConfig())
  })
})

describe("NAV_ITEMS", () => {
  it("equals NAV flat-mapped to its items", () => {
    expect(NAV_ITEMS).toEqual(NAV.flatMap((section) => section.items))
  })

  it("has 16 total items", () => {
    expect(NAV_ITEMS).toHaveLength(16)
  })
})
