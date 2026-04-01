export default function WhoWeArePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">À propos</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Qui sommes-nous ?</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14 space-y-10">
        <section className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre association</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Quality &amp; Research</strong> est une association scientifique à but non lucratif dédiée à la promotion
            de la qualité des soins et au développement de la recherche dans le secteur de la santé.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Fondée par des professionnels de santé et des chercheurs engagés, notre association fédère des acteurs de terrain,
            des académiques et des institutions autour d'objectifs communs : améliorer les pratiques, produire des savoirs
            fondés sur des preuves et former les générations futures.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "🎯", title: "Notre mission", text: "Promouvoir une culture de la qualité et de l'excellence dans les établissements de santé à travers la formation, la recherche et l'accompagnement." },
            { icon: "🤝", title: "Nos valeurs", text: "Rigueur scientifique, éthique, innovation, solidarité et ouverture constituent le socle de toutes nos actions." },
            { icon: "🌍", title: "Notre portée", text: "Un réseau actif de professionnels de santé, chercheurs, formateurs et institutions partenaires à l'échelle nationale et internationale." },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl bg-primary p-8 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-3">Rejoignez notre communauté</h2>
          <p className="text-green-100 mb-5">
            Que vous soyez professionnel de santé, chercheur, étudiant ou institution, votre engagement compte.
          </p>
          <a href="/contact" className="inline-block rounded-xl bg-white px-5 py-2.5 font-semibold text-primary transition hover:bg-green-50">
            Nous contacter
          </a>
        </section>
      </div>
    </div>
  );
}
