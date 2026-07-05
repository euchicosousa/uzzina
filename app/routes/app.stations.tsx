export function meta() {
  return [
    { title: "Estações | Uzzina" },
    { name: "description", content: "Gerenciamento de Estações da Agência" },
  ];
}

export default function AppStations() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Estações
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Página de Estações em construção.
        </p>
      </div>
    </div>
  );
}
