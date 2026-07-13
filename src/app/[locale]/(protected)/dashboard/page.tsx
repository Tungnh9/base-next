import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("dashboard") };
}

export default async function DashboardPage() {
  const t = await getTranslations("nav");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <h1>{t("dashboard")}</h1>

      <div className="max-w-2xl flex flex-col gap-8">
        {/* Default variant */}
        <div>
          <h6 className="mb-3">Default Accordion</h6>
          <Accordion type="single" collapsible defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion Item #1</AccordionTrigger>
              <AccordionContent>
                Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping.
                Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion Item #2</AccordionTrigger>
              <AccordionContent>
                Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.
                Jelly-o caramels chocolate bar toffee sweet roll powder halvah fruitcake.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Accordion Item #3</AccordionTrigger>
              <AccordionContent>
                Pudding candy canes sugar plum cookie chocolate cake powder croissant.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Border variant */}
        <div>
          <h6 className="mb-3">Border Styling</h6>
          <Accordion type="single" collapsible variant="border" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion Item #1</AccordionTrigger>
              <AccordionContent>
                Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping.
                Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion Item #2</AccordionTrigger>
              <AccordionContent>
                Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.
                Jelly-o caramels chocolate bar toffee sweet roll powder halvah fruitcake.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Accordion Item #3</AccordionTrigger>
              <AccordionContent>
                Pudding candy canes sugar plum cookie chocolate cake powder croissant.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
