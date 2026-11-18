import { NextResponse } from 'next/server';

// Railway debe comprobar que la aplicación responde sin depender de migraciones
// ni del estado momentáneo de PostgreSQL.
// Una comprobación de base de datos se añadirá a un endpoint interno autenticado.
export async function GET() {
  return NextResponse.json({ status: 'ok' }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
