import EventsHeroSlider from "./components/EventsHeroSlider";
import { events } from "@/data/events";

export default function Home() {
  return (
    <div className="overflow-hidden">
      
      <EventsHeroSlider items={events} />
    

      {/* MISSION SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
              Notre Mission
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Une Vision Claire pour la Santé de Demain
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Nous travaillons à créer un écosystème de santé plus efficace, accessible 
              et innovant grâce à la recherche scientifique et l'amélioration continue de la qualité.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🔬"
              title="Recherche Innovante"
              description="Nous soutenons des projets de recherche de pointe qui repoussent les limites de la médecine moderne."
            />
            <FeatureCard 
              icon="⚕️"
              title="Qualité des Soins"
              description="Notre engagement envers l'excellence garantit des standards élevés dans tous les aspects de la santé."
            />
            <FeatureCard 
              icon="🤝"
              title="Collaboration"
              description="Nous créons des ponts entre professionnels, institutions et chercheurs pour favoriser le partage."
            />
            <FeatureCard 
              icon="📊"
              title="Transparence"
              description="Nos rapports annuels assurent une totale transparence dans nos activités et notre gestion."
            />
            <FeatureCard 
              icon="🎓"
              title="Formation Continue"
              description="Nous organisons des événements éducatifs pour maintenir les compétences à jour."
            />
            <FeatureCard 
              icon="🌍"
              title="Impact Social"
              description="Notre travail vise à améliorer l'accès aux soins de qualité pour tous."
            />
          </div>

        </div>
      </section>

      {/* ACTIVITIES SECTION */}
      <section className="py-24 bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <div className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
              Nos Activités
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment Nous Œuvrons pour la Santé
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ActivityCard 
              title="Projets de Recherche"
              description="Découvrez nos initiatives en cours et nos résultats publiés dans le domaine de la recherche médicale."
              link="/projects"
              gradient="from-green-400 to-green-600"
            />
            <ActivityCard 
              title="Rapports Annuels"
              description="Consultez nos rapports moraux et financiers pour une transparence totale sur nos activités."
              link="/reports"
              gradient="from-teal-400 to-teal-600"
            />
            <ActivityCard 
              title="Appels à Candidature"
              description="Participez à nos programmes et candidatez pour rejoindre nos projets de recherche."
              link="/calls"
              gradient="from-emerald-400 to-emerald-600"
            />
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-24 bg-gradient-primary text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full -ml-40 -mb-40"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Rejoignez Notre Communauté
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Participez à nos événements, contribuez à nos projets de recherche et faites 
            partie d'un réseau de professionnels engagés pour l'amélioration de la santé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn btn-white text-base px-8 py-3">
              Devenir Membre
            </a>
            <a href="/contact" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-base px-8 py-3">
              Nous Contacter
            </a>
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-lightgreen rounded-3xl p-12 text-center">
            <h3 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Restez Informé
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Inscrivez-vous à notre newsletter pour recevoir nos dernières actualités et événements
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="btn btn-primary px-8 py-3">
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}

// Stat Card Component
function StatCard({ number, label, delay }: { number: string; label: string; delay: string }) {
  return (
    <div 
      className="text-center p-4 bg-lightgreen rounded-2xl hover:scale-105 transition-transform cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="font-display text-4xl font-bold text-primary mb-2">
        {number}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="group bg-white rounded-2xl p-8 shadow-custom-md hover:shadow-custom-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
      <div className="w-16 h-16 bg-lightgreen rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary transition-all">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ title, description, link, gradient }: { title: string; description: string; link: string; gradient: string }) {
  return (
    <a 
      href={link}
      className="group block bg-white rounded-2xl overflow-hidden shadow-custom-lg hover:shadow-custom-xl transition-all duration-300 hover:-translate-y-2"
    >
      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
      <div className="p-8">
        <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
          En savoir plus
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </a>
  );
}