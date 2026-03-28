"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // L'utilisateur dynamique
  const user = { name: "Djo Djo", role: "admin" };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[9999] transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-white py-5 border-b border-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* 1. LOGO */}
        <Link href="/" className="flex items-center gap-2 group outline-none">
          <div className="w-10 h-10 bg-[#1a9e5c] rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="text-xl font-bold italic">Q</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-lg font-bold text-[#0d2137] leading-none">Quality & Research</span>
            <span className="text-[9px] uppercase tracking-widest text-[#1a9e5c] font-bold">Excellence en Santé</span>
          </div>
        </Link>

        {/* 2. LIENS DE NAVIGATION (Centrés) */}
        <div className="hidden lg:flex items-center gap-8">
          {["Accueil", "À propos", "Nouveautés", "Projets et collaboration", "Événements"].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-sm font-semibold text-[#4a5a54] hover:text-[#1a9e5c] transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* 3. MENU UTILISATEUR DYNAMIQUE (Djo Djo) */}
        <div className="relative">
          
          {/* Bouton déclencheur */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-2 py-1 bg-transparent hover:bg-gray-50 rounded-lg transition-all cursor-pointer outline-none"
          >
            <div className="flex flex-col items-end">
              <span className="font-bold text-[#0d2137] text-sm leading-tight">{user.name}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{user.role}</span>
            </div>
            <div className="w-9 h-9 bg-[#1a9e5c] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Menu Déroulant (Dropdown) */}
          {isOpen && (
            <>
              {/* Overlay invisible pour fermer en cliquant à côté */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              ></div>
              
              {/* La boîte du menu */}
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-4 z-50 flex flex-col gap-3">
                
                <div className="border-b border-gray-100 pb-2 mb-1">
                  <p className="text-xs text-gray-400 font-medium">Connecté en tant que</p>
                  <p className="text-sm font-bold text-[#0d2137]">{user.name}</p>
                </div>

                {/* BOUTON ADMIN (Contour Vert) */}
                <Link 
                  href="/admin" 
                  className="w-full block py-2.5 border-2 border-[#1a9e5c] text-[#1a9e5c] bg-transparent font-bold rounded-full text-sm text-center hover:bg-[#e8f8ef] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>

                {/* BOUTON DÉCONNEXION (Fond Vert) */}
                <button 
                  onClick={() => { setIsOpen(false); console.log("Déconnexion"); }}
                  className="w-full py-2.5 bg-[#1a9e5c] text-white font-bold rounded-full text-sm text-center hover:bg-[#0e7a43] transition-colors shadow-md"
                >
                  Déconnexion
                </button>
                
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}