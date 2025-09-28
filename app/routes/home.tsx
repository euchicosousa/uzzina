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
      <div className="shrink border-r w-full min-w-[10vw]"></div>
      <div className="shrink-0 mx-auto flex h-dvh flex-col justify-between w-[80vw] lg:w-3xl">
        <div className="p-8 text-xl font-medium tracking-tighter border_after">
          Escolha qual app quer acessar
        </div>

        <div className="flex h-full flex-col text-[10vw] font-light tracking-tighter *:flex *:items-center *:py-6 md:text-[8vh] divide-y">
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
              className="group/link h-full flex items-center overflow-hidden  hover:bg-foreground hover:text-background transition-colors duration-500"
              to={item.href}
            >
              <span className="flex gap-4 shrink-0 w-[200%] group-hover/link:translate-x-0 -translate-x-1/2 transition-transform duration-1000">
                <span className="flex items-center gap-8 shrink-0 w-1/2 p-8">
                  <span className="text-7xl animate-spin animation-duration-[3000ms]">
                    ✳︎
                  </span>
                  <span className="w-1/2 text-xl font-medium tracking-normal ">
                    {item.title}
                    <br />
                    {item.description}
                  </span>
                </span>
                <span className="block shrink-0 w-1/2 p-8 font-medium tracking-wide">
                  {item.title}
                </span>
              </span>
            </Link>
          ))}
        </div>
        <div className="footer relative p-8 border_before text-right font-medium">
          CNVT®
        </div>
      </div>
      <div className="shrink border-l w-full min-w-[10vw]"></div>
    </div>
  );
}
