import {
  HeartIcon,
  InstagramIcon,
  MessageCircleIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { motion } from "motion/react";
import { cn } from "~/lib/utils";
import { UBadge } from "~/components/uzzina/UBadge";

export function CreateAndEditAction({
  BaseAction,
  onClose,
}: {
  BaseAction: Action;
  onClose: () => void;
}) {
  const [view, setView] = useState<"essential" | "instagram" | "chat">(
    "essential",
  );

  const [RawAction, setRawAction] = useState<Action>(BaseAction);

  useEffect(() => {
    setRawAction(BaseAction);
  }, [BaseAction]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: "circInOut" }}
      className="bg-background fixed top-17 right-0 bottom-0 z-10 flex h-full w-full shrink-0 flex-col overflow-hidden border-l md:w-2xl"
    >
      <div className="flex shrink-0 divide-x">
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "essential" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("essential")}
        >
          ESSENCIAL <HeartIcon className="size-4" />
        </div>
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "instagram" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("instagram")}
        >
          INSTAGRAM <InstagramIcon className="size-4" />
        </div>
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "chat" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("chat")}
        >
          CHAT <MessageCircleIcon className="size-4" />
        </div>
        <div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-b p-5 text-sm font-medium"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>
      <div className="relative flex grow flex-col gap-8 overflow-y-auto p-4">
        <div className="relative">
          <textarea
            value={RawAction.title}
            onChange={(e) =>
              setRawAction({ ...RawAction, title: e.target.value })
            }
            placeholder="Título"
            className={cn(
              "w-full shrink-0 resize-none overflow-hidden py-4 font-medium tracking-tighter outline-none focus:underline",
              RawAction.title.length > 70 ? "text-error text-4xl" : "text-5xl",
            )}
            //   @ts-ignore
            style={{ fieldSizing: "content" }}
            autoFocus
            maxLength={100}
          />
          {RawAction.title.length > 70 && (
            <div className="absolute right-0 bottom-0">
              <UBadge isDynamic value={RawAction.title.length} />
            </div>
          )}
        </div>
        <textarea
          value={RawAction.description || ""}
          onChange={(e) =>
            setRawAction({ ...RawAction, description: e.target.value })
          }
          placeholder="Descrição"
          className="h-full w-full resize-none overflow-hidden rounded border p-4 text-xl outline-none"
        />
        <div className="flex justify-end">
          <Button>Salvar</Button>
        </div>
      </div>
    </motion.div>
  );
}
