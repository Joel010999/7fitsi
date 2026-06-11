import Link from 'next/link';
import '../app/page.css'; // Reuse some global styles

export default function GiftcardPage() {
  const whatsappNumber = '5491100000000'; // Replace with actual number
  const message = 'Hola! Me gustaría comprar una Gift Card de 7cero Sports.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="home-wrapper" style={{ paddingTop: '6rem' }}>
      <section className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Gift Cards</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>El regalo perfecto para quienes aman moverse.</p>
        </div>

        <div style={{ 
          background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
          borderRadius: '20px',
          padding: '3rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          marginBottom: '3rem'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', opacity: 0.5, fontWeight: 700 }}>7CERO SPORTS</span>
            <h2 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>Regalá elección.</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '400px', lineHeight: 1.6 }}>
              Elegí el monto, personalizá tu dedicatoria y recibí una tarjeta digital de diseño premium lista para enviar o imprimir.
            </p>
          </div>
          <div style={{
            position: 'absolute',
            right: '-20%',
            top: '-20%',
            width: '60%',
            height: '140%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            zIndex: 1
          }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>1</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Elegí el monto</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Desde $10.000 hasta el valor que prefieras.</p>
          </div>
          <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>2</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Personalizá</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Agregá el nombre y un mensaje especial.</p>
          </div>
          <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>3</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Recibí y enviá</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Te enviamos la Gift Card digital por WhatsApp.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hero-btn primary" style={{ display: 'inline-block', padding: '1rem 3rem', fontSize: '1rem' }}>
            Comprar por WhatsApp
          </a>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Serás redirigido a WhatsApp para gestionar el pago y los detalles.
          </p>
        </div>
      </section>
    </div>
  );
}
