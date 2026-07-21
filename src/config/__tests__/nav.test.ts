import { describe, it, expect } from "vitest"
import { createNavConfig, NAV_ITEMS, NAV } from "../nav"
import { ROUTES } from "@/lib/constants"

describe("createNavConfig", () => {
  it("returns the expected section/item shape", () => {
    const config = createNavConfig()

    expect(config).toHaveLength(2)
    expect(config[0].items).toHaveLength(1)
    expect(config[1].title).toBe("nav.sectionAppsAndPages")
    expect(config[1].items).toHaveLength(2)
  })

  it("gives the Dashboard item the dashboard route and no requiredRole", () => {
    const [dashboardSection] = createNavConfig()
    const dashboardItem = dashboardSection.items[0]

    expect(dashboardItem.href).toBe(ROUTES.dashboard)
    expect(dashboardItem.requiredRole).toBeUndefined()
  })

  it("gives the Customers item the customers route and no requiredRole", () => {
    const [, appsSection] = createNavConfig()
    const customersItem = appsSection.items.find((item) => item.label === "nav.customers")

    expect(customersItem).toBeDefined()
    expect(customersItem?.href).toBe(ROUTES.customers)
    expect(customersItem?.requiredRole).toBeUndefined()
  })

  it("restricts the Employees item to the admin role and uses the employees route", () => {
    const [, appsSection] = createNavConfig()
    const employeesItem = appsSection.items.find((item) => item.label === "nav.employees")

    expect(employeesItem).toBeDefined()
    expect(employeesItem?.href).toBe(ROUTES.employees)
    expect(employeesItem?.requiredRole).toBe("admin")
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
})
