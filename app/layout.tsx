import Link from "next/link";
import "./globals.css";
import Image from "next/image";


export const metadata = {
  title: "Quality and Research - Excellence en Santé",
  description: "Association dédiée à la promotion de la recherche et de la qualité dans le secteur de la santé",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-100 animate-slide-down">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-3 no-underline flex-none shrink-0">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-custom-md group-hover:scale-110 transition-transform">
                  <Image
                    src="/logo12.png"
                    alt="Q&R Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    priority
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-display font-bold text-xl text-primary leading-none">
                    Quality &amp; Research
                  </span>
                  <span className="text-xs text-gray-600 leading-none mt-1">
                    Excellence en Santé
                  </span>
                </div>
              </Link>


              {/* Navigation Desktop */}
              <nav className="hidden md:flex flex-1 justify-center items-center gap-1 flex-nowrap whitespace-nowrap">
                <NavLink href="/">Accueil</NavLink>

                <NavDropdown label="À propos">
                  <DropdownItem href="/about/who-we-are">Qui sommes-nous ?</DropdownItem>
                  <DropdownItem href="/about/vision-mission">Vision &amp; Mission</DropdownItem>
                  <DropdownItem href="/about/president-message">Mot du Président</DropdownItem>
                  <DropdownItem href="/about/team">Équipe</DropdownItem>
                  <DropdownItem href="/about/partners">Partenaires</DropdownItem>
                </NavDropdown>

                <NavDropdown label="Nouveautés">
                  <DropdownItem href="/news/articles">Articles</DropdownItem>
                  <DropdownItem href="/news/events">Événements</DropdownItem>
                </NavDropdown>

                <NavLink href="/projects">Projets</NavLink>
                <NavLink href="/reports">Rapports</NavLink>
                <NavLink href="/school">École</NavLink>

                <NavDropdown label="Juridique">
                  <DropdownItem href="/legal/mentions-legales">Mentions légales</DropdownItem>
                  <DropdownItem href="/legal/privacy">Politique de confidentialité</DropdownItem>
                  <DropdownItem href="/legal/terms">Conditions d’utilisation</DropdownItem>
                </NavDropdown>

                <NavDropdown label="Appels">
                  <DropdownItem href="/calls/appelacondidatures">Appel à candidatures</DropdownItem>
                  <DropdownItem href="/calls/en-cours">Appels en cours</DropdownItem>
                </NavDropdown>

                <NavDropdown label="Contact">
                  <DropdownItem href="/contact">Nous contacter</DropdownItem>
                  <DropdownItem href="/contact/location">Localisation</DropdownItem>
                </NavDropdown>
              </nav>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-3 shrink-0">
                <Link 
                  href="/login" 
                  className="btn btn-outline text-sm px-5 py-2"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary text-sm px-5 py-2"
                >
                  Inscription
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 text-primary hover:bg-lightgreen rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow pt-24">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-custom-lg">
                    <Image
                    src="/logo12.png"
                    alt="Q&R Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    priority
                  />
                  </div>
                  <span className="font-display font-bold text-2xl text-white">
                    Quality &amp; Research
                  </span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                  Association dédiée à la promotion de la recherche scientifique 
                  et de la qualité dans le secteur de la santé.
                </p>
                <div className="flex gap-3">
                  <SocialLink href="#" icon="facebook" />
                  <SocialLink href="#" icon="twitter" />
                  <SocialLink href="#" icon="linkedin" />
                  <SocialLink href="#" icon="email" />
                </div>
              </div>

              {/* Navigation Column */}
              <div>
                <h4 className="font-semibold text-white mb-4">Navigation</h4>
                <ul className="space-y-2">
                  <FooterLink href="/">Accueil</FooterLink>
                  <FooterLink href="/about">À propos</FooterLink>
                  <FooterLink href="/projects">Projets</FooterLink>
                  <FooterLink href="/reports">Rapports</FooterLink>
                </ul>
              </div>

              {/* Resources Column */}
              <div>
                <h4 className="font-semibold text-white mb-4">Ressources</h4>
                <ul className="space-y-2">
                  <FooterLink href="/events">Événements</FooterLink>
                  <FooterLink href="/calls">Appels à Candidature</FooterLink>
                  <FooterLink href="/contact">Contact</FooterLink>
                  <FooterLink href="/faq">FAQ</FooterLink>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© {new Date().getFullYear()} Quality &amp; Research. Tous droits réservés.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Confidentialité
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}

function DropdownItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
    >
      {children}
    </Link>
  );
}

// Navigation Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative whitespace-nowrap px-3 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-50 font-medium text-sm transition-colors group"
    >
      {children}
      <span className="absolute bottom-1 left-3 right-3 h-0.5 scale-x-0 bg-primary origin-left group-hover:scale-x-100 transition-transform duration-300" />
    </Link>
  );
}
function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="relative whitespace-nowrap px-3 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-50 font-medium text-sm transition-colors flex items-center"
      >
        {label}
        <svg
          className="w-4 h-4 ml-1 text-gray-400 group-hover:text-primary transition-transform duration-200 group-hover:rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>

        <span className="absolute bottom-1 left-3 right-3 h-0.5 scale-x-0 bg-primary origin-left group-hover:scale-x-100 transition-transform duration-300" />
      </button>

      {/* zone dropdown */}
      <div
        className="absolute left-0 top-full z-50 w-64
                   opacity-0 invisible translate-y-1
                   group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                   transition duration-200 ease-out"
      >
        {/* petit pont invisible pour éviter la fermeture */}
        <div className="h-2" />

        <div className="rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
// Footer Link Component
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href}
        className="text-gray-400 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

// Social Link Component
function SocialLink({ href, icon }: { href: string; icon: string }) {
  const icons = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    email: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  };

  return (
    <a 
      href={href}
      className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-all hover:scale-110"
      aria-label={icon}
    >
      {icons[icon as keyof typeof icons]}
    </a>
  );
}