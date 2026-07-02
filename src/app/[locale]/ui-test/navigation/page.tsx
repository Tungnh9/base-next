"use client"

import { useState } from "react"
import { Star, Sun, Moon, Settings, Bell, Shield, Home } from "lucide-react"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis,
} from "@/components/ui/pagination"

const BODY_TEXT = "Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder. Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie."

function PaginationDemo({ size }: { size: "sm" | "default" | "lg" }) {
  const [page, setPage] = useState(3)
  const total = 7
  return (
    <Pagination size={size}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
        </PaginationItem>
        <PaginationItem><PaginationLink isActive={page === 1} onClick={() => setPage(1)}>1</PaginationLink></PaginationItem>
        {page > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
        {[...Array(total)].map((_, i) => {
          const n = i + 1
          if (n === 1 || n === total) return null
          if (Math.abs(n - page) > 1) return null
          return (
            <PaginationItem key={n}>
              <PaginationLink isActive={page === n} onClick={() => setPage(n)}>{n}</PaginationLink>
            </PaginationItem>
          )
        })}
        {page < total - 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
        <PaginationItem><PaginationLink isActive={page === total} onClick={() => setPage(total)}>{total}</PaginationLink></PaginationItem>
        <PaginationItem>
          <PaginationNext disabled={page === total} onClick={() => setPage(p => Math.min(total, p + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default function NavigationPage() {
  return (
    <div className="flex flex-col gap-16">
      <h1>Navigation</h1>

      {/* ── BREADCRUMB ── */}
      <section className="flex flex-col gap-10">
        <h4>Breadcrumb</h4>

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

      {/* ── PAGINATION ── */}
      <section className="flex flex-col gap-10">
        <h4>Pagination</h4>

        <div className="flex flex-col gap-3">
          <h6>Small</h6>
          <PaginationDemo size="sm" />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Default</h6>
          <PaginationDemo size="default" />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Large</h6>
          <PaginationDemo size="lg" />
        </div>

        <div className="flex flex-col gap-3">
          <h6>With Text Labels</h6>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious label="Previous" />
              </PaginationItem>
              <PaginationItem><PaginationLink>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink isActive>2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink>3</PaginationLink></PaginationItem>
              <PaginationItem>
                <PaginationNext label="Next" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Disabled</h6>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious disabled />
              </PaginationItem>
              <PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink>3</PaginationLink></PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
      </section>
    </div>
  )
}
