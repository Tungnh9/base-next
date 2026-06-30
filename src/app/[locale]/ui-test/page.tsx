import { Star, Sun, Moon, Settings, Bell, Shield } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const BODY_TEXT =
  "Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder. Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.";

export default function UiTestPage() {
  return (
    <div className="flex flex-col gap-12 p-8 max-w-3xl">
      <h1>UI Component Test</h1>

      {/* Default — no icons */}
      <section className="flex flex-col gap-4">
        <h5>Default Accordion</h5>
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
      </section>

      {/* Default — with icons */}
      <section className="flex flex-col gap-4">
        <h5>Default Accordion — With Icons</h5>
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
      </section>

      {/* Default — multiple open */}
      <section className="flex flex-col gap-4">
        <h5>Default Accordion — Multiple</h5>
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
      </section>

      {/* Border variant — no icons */}
      <section className="flex flex-col gap-4">
        <h5>Border Styling</h5>
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
      </section>

      {/* Border variant — with icons */}
      <section className="flex flex-col gap-4">
        <h5>Border Styling — With Icons</h5>
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
      </section>

      {/* Advance Styling — no icons */}
      <section className="flex flex-col gap-4">
        <h5>Advance Styling</h5>
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
      </section>

      {/* Advance Styling — with icons */}
      <section className="flex flex-col gap-4">
        <h5>Advance Styling — With Icons</h5>
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
      </section>
    </div>
  );
}
