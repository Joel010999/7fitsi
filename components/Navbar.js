'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link href="/mujer" onClick={() => setMenuOpen(false)}>Mujer</Link>
          <Link href="/hombre" onClick={() => setMenuOpen(false)}>Hombre</Link>
          <Link href="/unisex" onClick={() => setMenuOpen(false)}>Unisex</Link>
          <Link href="/giftcard" className="highlight" onClick={() => setMenuOpen(false)}>Gift Card</Link>
        </div>
      </div>
    </nav>
  );
}
