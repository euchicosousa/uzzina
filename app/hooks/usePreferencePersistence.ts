import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Person } from "~/types";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { updateMyPreferences } from "~/models/people";
import { getQuerySessionGeneration } from "~/lib/query-client";
import {
  createPreferencePersistence,
  preferenceRecord,
  type PreferencePatch,
} from "~/lib/preference-persistence";

export function usePreferencePersistence(person: Person) {
  const queryClient = useQueryClient();
  const controller = useRef<ReturnType<
    typeof createPreferencePersistence
  > | null>(null);
  const initialPerson = useRef(person);
  initialPerson.current = person;
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const owner = initialPerson.current;
    const userId = person.user_id;
    const generation = getQuerySessionGeneration(queryClient);
    setHasError(false);
    const persistence = createPreferencePersistence({
      initial: preferenceRecord(owner.preferences),
      isCurrent: () =>
        initialPerson.current.user_id === userId &&
        getQuerySessionGeneration(queryClient) === generation,
      save: async (patch) => {
        return preferenceRecord(
          await updateMyPreferences(createSupabaseBrowserClient(), patch),
        );
      },
      onChange: (preferences) => {
        owner.preferences = preferences;
      },
      onSaved: () => {
        setHasError(false);
      },
      onError: () => {
        setHasError(true);
        toast.error(
          "Não foi possível salvar suas preferências. Tente novamente.",
        );
      },
    });
    controller.current = persistence;
    return () => {
      persistence.dispose();
      controller.current = null;
    };
  }, [person.user_id, queryClient]);
  return {
    queuePreference: (patch: PreferencePatch) =>
      controller.current?.queue(patch),
    retry: () => controller.current?.retry(),
    hasError,
  };
}
