'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ dbCategories = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Separate regular categories from Gift Card for special styling
  const regularCats = dbCategories.filter(c => c.name.toLowerCase() !== 'gift card');
  const hasGiftCard = true; // Always display the Gift Card link in the navbar

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link href="/" className="logo">
          7cero <span>Sports</span>
        </Link>

        <button
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {regularCats.map(cat => (
            <Link
              key={cat.id}
              href={`/?category=${encodeURIComponent(cat.name)}#productos`}
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          {hasGiftCard && (
            <Link
              href="/?category=Gift Card#productos"
              className="highlight"
              onClick={() => setMenuOpen(false)}
            >
              Gift Card
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
