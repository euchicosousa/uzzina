import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `UZZINA` },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex overflow-hidden">
      <div className="w-[10vw] shrink-0 border-r lg:w-[4vw]"></div>
      <div className="mx-auto flex h-dvh w-[80vw] shrink-0 flex-col justify-between lg:w-[92vw]">
        <div className="border_after p-8 text-xl font-medium tracking-tighter">
          Escolha qual app quer acessar
        </div>

        <div className="flex h-full flex-col divide-y text-[10vw] tracking-tighter *:flex *:items-center *:py-6 md:text-[8vh]">
          {[
            {
              title: "UZZINA",
              description: "App de gestão da Agência CNVT®",
              href: "/app",
            },
            {
              title: "LINK",
              description:
                "Sistema de Links exclusivo de quem é parceiro da Agência CNVT®",
              href: "https://cnvt.link",
            },
            {
              title: "CNVT",
              description: "Site oficial da Agência CNVT®",
              href: "https://cnvt.com.br",
            },
          ].map((item, i) => (
            <Link
              key={i}
              className="group/link flex h-full items-center justify-between overflow-hidden transition-colors duration-500 hover:bg-foreground hover:text-background"
              to={item.href}
            >
              {/* <span className="flex items-center gap-8 shrink-0 w-1/2 p-8"> */}
              {/* <span className="text-7xl animate-spin animation-duration-[3000ms]">
                    ✳︎
                  </span> */}
              {/* <span className="w-1/2 text-xl font-medium tracking-normal ">
                    {item.title}
                    <br />
                    {item.description}
                  </span> */}
              {/* </span> */}
              <span className="hidden p-8 font-bold tracking-wide lg:block">
                {`0${i + 1}`}
              </span>
              <span className="block w-1/4 p-8 font-bold tracking-tighter">
                {item.title}
              </span>
              <span className="hidden w-1/6 p-8 text-base font-normal tracking-wide lg:block">
                {item.description}
              </span>
              <span className="relative block p-8">
                <div className="size-16 border-4 border-foreground border-b-transparent border-l-transparent duration-500 group-hover/link:border-t-background group-hover/link:border-r-background"></div>
                <div className="absolute top-1/2 left-1/2 h-1 w-20 -translate-x-1/2 -translate-y-1/2 rotate-135 bg-foreground duration-500 group-hover/link:bg-background"></div>
              </span>
            </Link>
          ))}
        </div>
        <div className="footer border_before relative p-8 text-right font-medium">
          CNVT®
        </div>
      </div>
      <div className="w-[10vw] shrink border-l lg:w-[4vw]"></div>
    </div>
  );
}
