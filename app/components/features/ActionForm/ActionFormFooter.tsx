import { IconLoader, IconPlus, IconCloudUpload } from "@tabler/icons-react";
import type { SubmitFunction } from "react-router";
import { toast } from "sonner";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { StatesCombobox } from "~/components/features/StatesCombobox";
import { Button } from "~/components/ui/button";
import { ActionColorDropdown } from "~/components/features/ActionForm/ActionColorDropdown";
import { INTENT } from "~/lib/CONSTANTS";
import { handleAction, isInstagramFeed } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";

interface ActionFormFooterProps {
  RawAction: Action;
  setRawAction: (action: Action) => void;
  updateAction: (data?: { [key: string]: any }) => Promise<void>;
  currentPartners: Partner[];
  isPending: boolean;
  submit: SubmitFunction;
}

export function ActionFormFooter({
  RawAction,
  setRawAction,
  updateAction,
  currentPartners,
  isPending,
  submit,
}: ActionFormFooterProps) {
  return (
    <div className="w-fulld flex shrink-0 justify-between overflow-hidden border-t">
      {/* Coisas */}
      <div className="flex items-center divide-x overflow-hidden">
        {/* Parceiros Partners Combobox */}
        <div className="overflow-hidden">
          <PartnersCombobox
            selectedPartners={RawAction.partners}
            tabIndex={3}
            onSelect={async (selected) => {
              setRawAction({
                ...RawAction,
                partners: selected,
              });
              await updateAction({ partners: selected });
            }}
          />
        </div>
        {/* Estados States Combobox */}
        <div className="">
          <StatesCombobox
            selectedState={RawAction.state}
            tabIndex={4}
            onSelect={async (selected) => {
              setRawAction({
                ...RawAction,
                state: selected,
              });
              await updateAction({ state: selected });
            }}
          />
        </div>
        {/* Categorias Categories Combobox */}
        <div className="">
          <CategoriesCombobox
            selectedCategories={[RawAction.category]}
            tabIndex={5}
            onSelect={async ({ category }) => {
              setRawAction({
                ...RawAction,
                category,
              });
              await updateAction({ category });
            }}
          />
        </div>
        {isInstagramFeed(RawAction.category) && (
          <div>
            <ActionColorDropdown
              action={RawAction}
              partners={currentPartners}
              tabIndex={6}
              onSelect={async (color) => {
                setRawAction({ ...RawAction, color });
                await updateAction({ color });
              }}
            />
          </div>
        )}
      </div>
      {/* Botão de criar e atualizar */}
      <div className="p-4">
        <Button
          disabled={isPending}
          className="squircle rounded-2xl"
          tabIndex={7}
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (!RawAction.title) {
              toast.error("Erro / O título é obrigatório", {
                position: "top-center",
              });
              return;
            }

            if (RawAction.partners.length === 0) {
              toast.error(
                "Erro / Pelo menos um parceiro deve ser selecionado",
                {
                  position: "top-center",
                },
              );
              return;
            }

            await handleAction(
              {
                ...RawAction,
                intent: RawAction.id
                  ? INTENT.update_action
                  : INTENT.create_action,
              },
              submit,
            );
          }}
        >
          {RawAction.id ? "Atualizar" : "Criar Ação"}

          {isPending ? (
            <IconLoader className="animate-spin" />
          ) : RawAction.id ? (
            <IconCloudUpload />
          ) : (
            <IconPlus />
          )}
        </Button>
      </div>
    </div>
  );
}
