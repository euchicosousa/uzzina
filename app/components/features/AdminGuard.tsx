import type React from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlertIcon } from "lucide-react";
import { buttonVariants } from "~/components/prism/button";
import { useAppContext } from "~/contexts/AppContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Componente de proteção de rotas administrativas.
 * Bloqueia usuários que não possuem a flag person.admin = true,
 * exibindo mensagem clara de acesso negado e botão de retorno.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { person } = useAppContext();

  if (!person?.admin) {
    return (
      <div className="mx-auto flex h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlertIcon className="size-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground">
          Esta área é restrita a administradores da agência. Você não possui
          permissão para visualizar ou gerenciar estes recursos.
        </p>
        <Link
          className={buttonVariants({
            variant: "default",
          })}
          to="/app"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
