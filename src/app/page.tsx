import Link from 'next/link';

const features = [
  { icon: '✳', title: 'Una carta con personalidad', description: 'Diseños cuidados que se adaptan al estilo de cada restaurante sin complicaciones técnicas.' },
  { icon: '◷', title: 'Siempre al día', description: 'Platos especiales y promociones programadas para que la carta acompañe al servicio.' },
  { icon: '◎', title: 'Agotado, pero visible', description: 'El camarero indica que un plato se ha agotado y el cliente podrá descubrirlo para otra visita.' },
];

export default function Home() {
  return (
    <main className="site-home">
      <nav className="site-nav" aria-label="Navegación principal">
        <Link className="site-logo" href="/"><span className="logo-mark">✳</span> smartmenu</Link>
        <div className="site-nav-links">
          <Link href="#funciones">Características</Link>
          <Link href="/acceso">Acceder</Link>
          <Link className="site-link-primary" href="/registro-restaurante">Crear restaurante →</Link>
        </div>
      </nav>
      <section className="site-hero">
        <div>
          <p className="site-eyebrow">La nueva forma de presentar tu carta</p>
          <h1>Tu carta,<br/><em>tu esencia.</em></h1>
          <p className="site-lead">Una carta digital tan especial como tu restaurante. Bonita, fácil de mantener y preparada para cambiar al ritmo de tu cocina.</p>
          <div className="site-actions">
            <Link className="site-button site-button--solid" href="/registro-restaurante">Crear mi restaurante ↗</Link>
            <Link className="site-button site-button--outline" href="/demo/temas">Ver diseños de carta</Link>
          </div>
        </div>
        <div className="hero-poster" aria-label="Ejemplo decorativo de carta digital">
          <div className="hero-poster-inner">
            <span className="hero-poster-stars" aria-hidden="true">✳</span>
            <p>UNA EXPERIENCIA A TU MEDIDA</p>
            <h2>Cada plato<br/>tiene una<br/><em>historia.</em></h2>
            <p>HAZ QUE TU CARTA LA CUENTE</p>
          </div>
        </div>
      </section>
      <section id="funciones" className="site-section">
        <p className="site-eyebrow">Pensado para hostelería</p>
        <h2>Todo lo importante,<br/>sin complicaciones.</h2>
        <div className="site-features">
          {features.map(feature => (
            <article className="site-feature" key={feature.title}>
              <div className="site-feature-symbol" aria-hidden="true">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="site-footer">Smart Menu SaaS · En desarrollo. Las funciones de pedidos y gestión privada todavía no están disponibles.</footer>
    </main>
  );
}
