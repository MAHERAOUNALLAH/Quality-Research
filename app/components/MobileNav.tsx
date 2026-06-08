"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HandCoins, Heart, Mail, ShoppingCart, X } from "lucide-react";
import NavbarAuth from "./NavbarAuth";

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
    >
      {children}
    </Link>
  );
}

function MobileDropdown({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const close = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  return (
    <>
      <button
        className="rounded-lg p-2 text-primary transition-colors hover:bg-lightgreen md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[72px] z-40 bg-black/20 md:hidden"
            onClick={close}
          />

          {/* Menu Panel */}
          <div className="fixed inset-x-0 top-[72px] z-50 max-h-[calc(100vh-72px)] overflow-y-auto bg-white shadow-xl md:hidden">
            <nav className="flex flex-col space-y-1 px-4 py-4">
              <MobileNavLink href="/" onClick={close}>Accueil</MobileNavLink>

              <MobileDropdown
                label="À propos"
                isOpen={openDropdown === "about"}
                onToggle={() => toggleDropdown("about")}
              >
                <MobileNavLink href="/about/who-we-are" onClick={close}>Qui sommes-nous ?</MobileNavLink>
                <MobileNavLink href="/about/vision-mission" onClick={close}>Vision &amp; Mission</MobileNavLink>
                <MobileNavLink href="/about/president-message" onClick={close}>Mot du Président</MobileNavLink>
                <MobileNavLink href="/about/team" onClick={close}>Équipe</MobileNavLink>
                <MobileNavLink href="/about/partners" onClick={close}>Partenaires</MobileNavLink>
                <MobileNavLink href="/about/rapport-activite" onClick={close}>Rapport d&apos;activité</MobileNavLink>
                <MobileNavLink href="/about/rapport-financier" onClick={close}>Rapport financier</MobileNavLink>
              </MobileDropdown>

              <MobileDropdown
                label="Nouveautés"
                isOpen={openDropdown === "news"}
                onToggle={() => toggleDropdown("news")}
              >
                <MobileNavLink href="/news/articles" onClick={close}>Articles</MobileNavLink>
                <MobileNavLink href="/news/events" onClick={close}>Événements</MobileNavLink>
                <MobileNavLink href="/news/formation" onClick={close}>Formation</MobileNavLink>
                <MobileNavLink href="/news/appel-a-candidatures" onClick={close}>Appel à candidatures</MobileNavLink>
              </MobileDropdown>

              <MobileNavLink href="/projects" onClick={close}>Projets et collaboration</MobileNavLink>
              <MobileNavLink href="/school" onClick={close}>Ressources</MobileNavLink>

              <MobileDropdown
                label="Juridique"
                isOpen={openDropdown === "legal"}
                onToggle={() => toggleDropdown("legal")}
              >
                <MobileNavLink href="/legal/mentions-legales" onClick={close}>Mentions légales</MobileNavLink>
                <MobileNavLink href="/legal/privacy" onClick={close}>Politique de confidentialité</MobileNavLink>
                <MobileNavLink href="/legal/terms" onClick={close}>Conditions d&apos;utilisation</MobileNavLink>
              </MobileDropdown>

              {/* Icon links row */}
              <div className="mt-2 flex gap-2 border-t border-gray-100 px-4 pt-4">
                <Link
                  href="/favorites"
                  aria-label="Favoris"
                  onClick={close}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                >
                  <Heart className="h-5 w-5" />
                  <span>Favoris</span>
                </Link>
                <Link
                  href="/cart"
                  aria-label="Panier"
                  onClick={close}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Panier</span>
                </Link>
                <Link
                  href="/donation"
                  aria-label="Donation"
                  onClick={close}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                >
                  <HandCoins className="h-5 w-5" />
                  <span>Don</span>
                </Link>
                <Link
                  href="/contact"
                  aria-label="Contact"
                  onClick={close}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                >
                  <Mail className="h-5 w-5" />
                  <span>Contact</span>
                </Link>
              </div>

              {/* Auth buttons */}
              <div className="border-t border-gray-100 px-4 pt-4 pb-2">
                <NavbarAuth />
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
