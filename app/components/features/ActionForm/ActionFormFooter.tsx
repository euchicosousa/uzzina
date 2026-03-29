import {
  CloudUploadIcon,
  CopyIcon,
  LoaderIcon,
  PlusIcon,
  RabbitIcon,
  TrashIcon,
} from "lucide-react";
import { useRouteLoaderData, useSubmit } from "react-router";
import { ActionColorDropdown } from "~/components/features/ActionForm/ActionColorDropdown";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { StatesCombobox } from "~/components/features/StatesCombobox";
import { Button } from "~/components/ui/button";
import { UToggleInput } from "~/components/uzzina/UToggle";
import { INTENT } from "~/lib/CONSTANTS";
import {
  handleAction,
  isInstagramFeed,
  isSprint,
  submitDeleteAction,
  toggleSprintAction,
} from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import type { AppLoaderData } from "~/routes/app";

interface ActionFormFooterProps {
  RawAction: Action;
  setRawAction: (action: Action) => void;
  updateAction: (data?: { [key: string]: any }) => Promise<void>;
  currentPartners: Partner[];
  isPending: boolean;
  handleSave: () => void;
  handleClose: () => void;
}

export function ActionFormFooter({
  RawAction,
  setRawAction,
  updateAction,
  currentPartners,
  isPending,
  handleSave,
  handleClose,
}: ActionFormFooterProps) {
  const submit = useSubmit();
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;
  const isInSprint = isSprint(RawAction, person);

  return (
    <div className="w-fulld flex shrink-0 justify-between overflow-hidden border-t">
      {/* Coisas */}
      <div className="flex items-center divide-x overflow-hidden">
        {/* Parceiros Partners Combobox */}
        <div className="overflow-hidden">
          <PartnersCombobox
            selectedPartners={RawAction.partners}
            tabIndex={3}
            showText={false}
            onSelect={async (selected) => {
              setRawAction({
                ...RawAction,
                partners: selected,
              });
              // await updateAction({ partners: selected });
            }}
          />
        </div>
        {/* Estados States Combobox */}
        <div>
          <StatesCombobox
            selectedState={RawAction.state}
            tabIndex={4}
            showText={false}
            onSelect={async (selected) => {
              setRawAction({
                ...RawAction,
                state: selected,
              });
              // await updateAction({ state: selected });
            }}
          />
        </div>
        {/* Categorias Categories Combobox */}
        <div>
          <CategoriesCombobox
            selectedCategories={[RawAction.category]}
            tabIndex={5}
            showText={false}
            onSelect={async ({ category }) => {
              setRawAction({
                ...RawAction,
                category,
              });
              // await updateAction({ category });
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
                // await updateAction({ color });
              }}
            />
          </div>
        )}
      </div>
      {/* Botão de criar e atualizar */}
      <div className="flex items-center gap-2 p-2">
        {RawAction.id && (
          <>
            <UToggleInput
              id="sprint"
              name="sprint"
              defaultChecked={isInSprint}
              tabIndex={7}
              className="py-3"
              onCheckedChange={(checked) => {
                toggleSprintAction(RawAction, person.user_id, submit);
              }}
            >
              <RabbitIcon className="size-5" />
            </UToggleInput>
            <button
              title="Duplicar ação (Shift+D)"
              className="flex items-center gap-2 rounded-2xl p-2 text-sm opacity-50 hover:opacity-100 focus:opacity-100"
              onClick={() => {
                handleAction(
                  { id: RawAction.id, intent: INTENT.duplicate_action },
                  submit,
                );
                handleClose();
              }}
            >
              <CopyIcon className="size-5" />
            </button>
            <button
              title="Excluir ação"
              className="flex items-center gap-2 rounded-2xl p-2 text-sm opacity-50 hover:opacity-100 focus:opacity-100"
              onClick={() => {
                if (confirm("Tem certeza que deseja excluir esta ação?")) {
                  submitDeleteAction(RawAction, submit);
                  handleClose();
                }
              }}
            >
              <TrashIcon className="size-5" />
            </button>
          </>
        )}
        <Button
          disabled={isPending}
          className="squircle rounded-2xl"
          tabIndex={7}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSave();
            if (event.shiftKey) {
              handleClose();
            }
          }}
        >
          {RawAction.id
            ? isPending
              ? "Atualizando..."
              : "Atualizar"
            : isPending
              ? "Criando..."
              : "Criar Ação"}

          {isPending ? (
            <LoaderIcon className="animate-spin" />
          ) : RawAction.id ? (
            <CloudUploadIcon />
          ) : (
            <PlusIcon />
          )}
        </Button>
      </div>
    </div>
  );
}
