const features = [
  { title: 'Cartas personalizables', description: 'Platos, bebidas e imágenes organizados de manera clara.' },
  { title: 'Alérgenos y variantes', description: 'Información alimentaria revisada por el restaurante.' },
  { title: 'Ofertas programadas', description: 'Especialidades y promociones en fechas concretas.' },
  { title: 'Agotados visibles', description: 'Los platos agotados permanecen visibles y no se pueden pedir.' },
];

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">SMART MENU · BASE DEL PROYECTO</p>
        <h1>Tu carta digital, siempre al día.</h1>
        <p>Estamos construyendo una plataforma sencilla para crear cartas, programar ofertas y agilizar el servicio.</p>
      </header>
      <section className="grid" aria-label="Funcionalidades previstas">
        {features.map(({ title, description }) => (
          <article className="feature" key={title}><h2>{title}</h2><p>{description}</p></article>
        ))}
      </section>
      <p className="notice">Esta es la base técnica inicial. No hay cuentas, base de datos ni comandas habilitadas todavía.</p>
    </main>
  );
}
