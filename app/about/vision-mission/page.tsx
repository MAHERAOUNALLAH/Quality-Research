export default function VisionMissionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">À propos</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Vision &amp; Mission</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14 space-y-10">
        <div className="grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border-l-4 border-primary bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🔭</span> Notre Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Être l'organisation de référence en matière de qualité et de recherche en santé — un catalyseur de
              changement positif pour les systèmes de santé, les professionnels et les patients.
            </p>
          </section>
          <section className="rounded-2xl border-l-4 border-green-400 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🚀</span> Notre Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Fédérer, former et accompagner les acteurs de la santé dans l'amélioration continue de la qualité des soins
              et la production de connaissances scientifiques rigoureuses.
            </p>
          </section>
        </div>

        <section className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos objectifs stratégiques</h2>
          <div className="space-y-4">
            {[
              "Promouvoir les démarches d'accréditation et de certification dans les établissements de santé.",
              "Développer des programmes de formation continue adaptés aux besoins des professionnels.",
              "Soutenir et valoriser la recherche scientifique nationale en santé.",
              "Créer des synergies entre institutions, chercheurs et praticiens.",
              "Diffuser les bonnes pratiques et les résultats de recherche à grande échelle.",
            ].map((obj, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-lightgreen text-primary font-bold text-sm">
                  {i + 1}
                </span>
                <p className="text-gray-600 leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
