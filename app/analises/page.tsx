export default function AnalisesPage() {
    const analises = [
      {
        slug: "flamengo-x-palmeiras",
        titulo: "Flamengo x Palmeiras",
        odd: "2.15",
        confianca: "5/5",
      },
      {
        slug: "real-madrid-x-barcelona",
        titulo: "Real Madrid x Barcelona",
        odd: "1.90",
        confianca: "4/5",
      },
    ];
  
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">
          Análises do Dia
        </h1>
  
        <div className="grid gap-4">
          {analises.map((item) => (
            <a
              key={item.slug}
              href={`/analises/${item.slug}`}
              className="border border-zinc-800 rounded-xl p-5 hover:border-yellow-400 transition"
            >
              <h2 className="text-2xl font-bold mb-2">
                {item.titulo}
              </h2>
  
              <p className="text-zinc-400">
                Odd: {item.odd}
              </p>
  
              <p className="text-zinc-400">
                Confiança: {item.confianca}
              </p>
            </a>
          ))}
        </div>
      </main>
    );
  }