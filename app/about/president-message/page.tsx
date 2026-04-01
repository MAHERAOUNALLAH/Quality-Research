export default function PresidentMessagePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">À propos</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Mot du Président</h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-2xl bg-white p-10 shadow-sm border border-gray-100">
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
            <div className="h-20 w-20 rounded-full bg-lightgreen flex items-center justify-center text-primary font-bold text-3xl flex-shrink-0">
              M
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pr. Khaled Mbarek</h2>
              <p className="text-primary font-medium">Président de Quality &amp; Research</p>
            </div>
          </div>
          <div className="space-y-5 text-gray-600 leading-relaxed text-[1.05rem]">
            <p>
              <em className="text-primary font-semibold text-lg not-italic">Chères amies, chers amis,</em>
            </p>
            <p>
              C'est avec une immense fierté et un profond sentiment de responsabilité que je m'adresse à vous en ma qualité
              de Président de l'association <strong>Quality &amp; Research</strong>.
            </p>
            <p>
              Depuis sa création, notre association n'a cessé de porter haut les valeurs de rigueur scientifique,
              d'engagement éthique et d'innovation au service de la santé. Chaque jour, des professionnels dévoués,
              des chercheurs passionnés et des institutions partenaires contribuent à faire de Quality &amp; Research
              un lieu de rencontres, d'échanges et de progrès.
            </p>
            <p>
              Dans un contexte mondial où les systèmes de santé font face à des défis sans précédent — pandémies,
              vieillissement démographique, inégalités d'accès aux soins — la recherche et la qualité ne sont plus
              des options, mais des impératifs.
            </p>
            <p>
              Notre ambition est claire : devenir la référence nationale et régionale en matière de promotion de la qualité
              des soins, de soutien à la recherche clinique et de formation des professionnels de santé.
            </p>
            <p>
              Je vous invite à rejoindre cette belle aventure, à partager vos expériences et à contribuer, chacun à votre
              niveau, à l'amélioration du système de santé.
            </p>
            <p className="font-semibold text-gray-800">
              Ensemble, faisons de la qualité une culture et de la recherche un réflexe.
            </p>
            <p className="text-right font-medium text-gray-700 mt-6">
              Pr. Khaled Mbarek<br />
              <span className="text-primary">Président, Quality &amp; Research</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
