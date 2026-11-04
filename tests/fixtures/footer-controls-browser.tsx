import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionFormFooter } from "~/components/features/action-drawer/ActionFormFooter";
import { UComboboxTrigger } from "~/components/uzzina/UComboboxTrigger";
import { AppContext } from "~/contexts/AppContext";
import type { Action, Partner } from "~/types";
import {
  CalendarTestProviders,
  calendarAction,
  calendarPerson,
} from "./calendar-height";
import "~/tailwind.css";

const partners: Partner[] = ["Alpha", "Beta"].map((title, index) => ({
  id: `partner-${index}`,
  slug: title.toLowerCase(),
  title,
  short: title,
  colors: ["#666666"],
  users_ids: [],
  archived: false,
  image: null,
  sow: "socialmedia",
  created_at: "2026-10-06T10:00:00Z",
  instagram_caption_tail: null,
  context: null,
  voice: null,
}));
function Footer({ name }: { name: string }) {
  const [action, setAction] = useState<Action>(
    calendarAction(0, {
      title: name,
      category: "post",
      partners: new URLSearchParams(location.search).has("empty")
        ? []
        : ["alpha", "beta"],
    }),
  );
  const [patches, setPatches] = useState<Record<string, unknown>[]>([]);
  return (
    <section data-testid={name} style={{ width: "min(672px, 100vw)" }}>
      <ActionFormFooter
        compact={innerWidth < 640}
        RawAction={action}
        setRawAction={setAction}
        updateAction={async (patch) =>
          setPatches((previous) => [...previous, patch ?? {}])
        }
        currentPartners={partners}
        isPending={false}
        handleSave={async () => true}
        handleClose={() => {}}
      />
      <output data-testid={`${name}-patches`}>{JSON.stringify(patches)}</output>
    </section>
  );
}
function Fixture() {
  const [presses, setPresses] = useState(0);
  return (
    <CalendarTestProviders>
      <AppContext.Provider
        value={{
          person: calendarPerson,
          partners,
          cloudName: "test",
          uploadPreset: "test",
          setPrimaryAction: () => {},
          partnerFilters: [],
          setPartnerFilters: () => {},
        }}
      >
        <div className="flex">
          <Footer name="primary" />
          {innerWidth >= 1600 && <Footer name="secondary" />}
        </div>
        <UComboboxTrigger
          variant="ghost"
          size="icon-lg"
          disabled
          onPress={() => setPresses((value) => value + 1)}
        >
          Disabled
        </UComboboxTrigger>
        <output data-testid="disabled-presses">{presses}</output>
      </AppContext.Provider>
    </CalendarTestProviders>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
