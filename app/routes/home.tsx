import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
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
      <div className="shrink-0 border-r w-[10vw] lg:w-[4vw]"></div>
      <div className="shrink-0 mx-auto flex h-dvh flex-col justify-between w-[80vw] lg:w-[92vw]">
        <div className="p-8 text-xl font-medium tracking-tighter border_after">
          Escolha qual app quer acessar
        </div>

        <div className="flex h-full flex-col text-[10vw] font-light  tracking-tighter *:flex *:items-center *:py-6 md:text-[8vh] divide-y">
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
              className="h-full overflow-hidden hover:bg-foreground hover:text-background transition-colors duration-500 flex items-center justify-between group/link"
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
              <span className="hidden lg:block p-8 font-bold tracking-wide">
                {`0${i + 1}`}
              </span>
              <span className="block p-8 font-bold tracking-tighter w-1/4">
                {item.title}
              </span>
              <span className="hidden lg:block p-8 text-base tracking-wide w-1/6 font-normal ">
                {item.description}
              </span>
              <span className="block p-8 relative">
                <div className="border-4 size-16 border-b-transparent border-l-transparent border-foreground group-hover/link:border-t-background group-hover/link:border-r-background duration-500">

                </div>
                <div className="absolute h-1 bg-foreground w-20 rotate-135 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/link:bg-background duration-500"></div>
              </span>

            </Link>
          ))}
        </div>
        <div className="footer relative p-8 border_before text-right font-medium">
          CNVT®
        </div>
      </div>
      <div className="shrink border-l w-[10vw] lg:w-[4vw]"></div>
    </div>
  );
}
