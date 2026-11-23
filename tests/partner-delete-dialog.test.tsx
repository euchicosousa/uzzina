import "./dom-setup";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PartnerDeleteConfirmDialog } from "~/components/features/PartnerDeleteConfirmDialog";
import type { PartnerDeletePreview } from "~/lib/partner-delete-contract";

const samplePreview: PartnerDeletePreview = {
  partner: {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "marca-teste",
    title: "Marca Teste",
    short: "MT",
    image: null,
    colors: ["#111111", "#ffffff"],
    archived: true,
    sow: "marketing",
  },
  snapshot: {
    exclusiveActions: 2,
    sharedActions: 1,
    exclusiveClients: 1,
    sharedClients: 1,
  },
  exclusiveActions: [
    {
      id: "a1",
      title: "Ação 1",
      date: "2026-11-10T11:00:00",
      category: "post",
      phase: "done",
      archived: false,
    },
    {
      id: "a2",
      title: "Ação 2",
      date: "2026-11-11T11:00:00",
      category: "reels",
      phase: "finished",
      archived: true,
    },
  ],
  sharedActions: [
    {
      id: "a3",
      title: "Ação compartilhada",
      date: "2026-11-12T11:00:00",
      phase: "doing",
      remainingPartners: ["outra-marca"],
      clearsPartnerTopic: false,
    },
  ],
  cascadesFromExclusiveActions: {
    commentsCount: 3,
    notificationsCount: 1,
    strategyOperationsCount: 0,
  },
  exclusiveClients: [
    {
      id: "c1",
      name: "Cliente Único",
      email: "unico@marca.com",
      active: true,
    },
  ],
  sharedClients: [
    {
      id: "c2",
      name: "Cliente Compartilhado",
      email: "shared@grupo.com",
      active: true,
      remainingPartners: ["outra-marca"],
    },
  ],
  topics: [{ id: "t1", title: "Institucional", color: "#ff0000" }],
  planning: {
    socialPlansCount: 1,
    socialPlanActionLinksCount: 2,
    themeRequestsCount: 1,
  },
  holidaysCount: 2,
  media: {
    totalCount: 4,
    orphanCandidatesCount: 3,
    sharedElsewhereCount: 1,
    sampleOrphanUrls: [],
  },
};

describe("PartnerDeleteConfirmDialog", () => {
  afterEach(cleanup);

  it("keeps destructive button disabled until exact slug is typed and confirms on click", () => {
    const onConfirm = mock(() => {});
    const onOpenChange = mock(() => {});

    render(
      <PartnerDeleteConfirmDialog
        errorMessage={null}
        isDeleting={false}
        isOpen={true}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        preview={samplePreview}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /Excluir definitivamente/i,
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    const input = screen.getByPlaceholderText(
      "marca-teste",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "marca" } });
    expect(confirmButton.disabled).toBe(true);

    fireEvent.change(input, { target: { value: "marca-teste" } });
    expect(confirmButton.disabled).toBe(false);

    const form = confirmButton.closest("form");
    expect(form).toBeTruthy();
    if (form) {
      fireEvent.submit(form);
    }
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows error alert when submission fails", () => {
    render(
      <PartnerDeleteConfirmDialog
        errorMessage="A função de exclusão definitiva ainda não foi aplicada."
        isDeleting={false}
        isOpen={true}
        onConfirm={() => {}}
        onOpenChange={() => {}}
        preview={samplePreview}
      />,
    );

    expect(
      screen.getByText(
        "A função de exclusão definitiva ainda não foi aplicada.",
      ),
    ).toBeTruthy();
  });
});
