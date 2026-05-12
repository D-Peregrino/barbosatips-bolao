type Props = {
  params: {
    slug: string;
  };
};

export default function AnaliseIndividualPage({ params }: Props) {
  const titulo = params.slug
    .replaceAll("-", " ")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <a href="/analises" className="text-yellow-400">
        ← Voltar para análises
      </a>

      <h1 className="mt-8 text-4xl font-bold text-yellow-400">
        {titulo}
      </h1>

      <p className="mt-4 max-w-2xl text-zinc-400">
        Página dinâmica carregada pelo slug da URL.
      </p>
    </main>
  );
}