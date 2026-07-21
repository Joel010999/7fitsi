'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar({ dbCategories = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/product/');

  useEffect(() => {
    const SCROLL_THRESHOLD = 60;
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    // On product pages, re-evaluate immediately on route change
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Separate regular categories from Gift Card for special styling
  const regularCats = dbCategories.filter(c => c.name.toLowerCase() !== 'gift card');
  const hasGiftCard = true; // Always display the Gift Card link in the navbar

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isProductPage && !scrolled ? 'navbar-hidden' : ''}`}>
      <div className="container navbar-container">
        <Link href="/" className="logo">
          7cero <span>Sports</span>
        </Link>

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

        <div className="navbar-actions">
          <button
            className="cart-icon-btn"
            onClick={openCart}
            aria-label="Abrir carrito"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="cart-badge" key={totalItems}>
                {totalItems}
              </span>
            )}
          </button>

          <button
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

