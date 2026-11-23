import "./dom-setup";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CloudinaryDeleteConfirmDialog } from "~/components/features/CloudinaryDeleteConfirmDialog";

describe("CloudinaryDeleteConfirmDialog", () => {
  afterEach(cleanup);

  it("requires typing EXCLUIR before enabling deletion", () => {
    const onConfirm = mock(() => {});

    render(
      <CloudinaryDeleteConfirmDialog
        errorMessage={null}
        formattedTotalBytes="1,5 MB"
        isDeleting={false}
        isOpen={true}
        onConfirm={onConfirm}
        onOpenChange={() => {}}
        selectedCount={3}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /Excluir selecionados/i,
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    const input = screen.getByPlaceholderText("EXCLUIR") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "APAGAR" } });
    expect(confirmButton.disabled).toBe(true);

    fireEvent.change(input, { target: { value: "excluir" } });
    expect(confirmButton.disabled).toBe(false);

    const form = confirmButton.closest("form");
    expect(form).toBeTruthy();
    if (form) {
      fireEvent.submit(form);
    }
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("displays deletion errors inside the dialog", () => {
    render(
      <CloudinaryDeleteConfirmDialog
        errorMessage="Sem permissão para excluir arquivos."
        formattedTotalBytes="400 KB"
        isDeleting={false}
        isOpen={true}
        onConfirm={() => {}}
        onOpenChange={() => {}}
        selectedCount={1}
      />,
    );

    expect(
      screen.getByText("Sem permissão para excluir arquivos."),
    ).toBeTruthy();
  });

  it("shows an action unlinking warning when affectedActionsCount is greater than zero", () => {
    render(
      <CloudinaryDeleteConfirmDialog
        affectedActionsCount={4}
        errorMessage={null}
        formattedTotalBytes="3,2 MB"
        isDeleting={false}
        isOpen={true}
        onConfirm={() => {}}
        onOpenChange={() => {}}
        selectedCount={2}
      />,
    );

    expect(
      screen.getByText("Atenção: desvinculação automática em ações"),
    ).toBeTruthy();
    expect(screen.getByText(/4 ação\(ões\) da UZZINA/i)).toBeTruthy();
  });
});
