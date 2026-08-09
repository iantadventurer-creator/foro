import { NextResponse } from 'next/server';

export async function GET() {
    const BEHOLD_URL = 'https://feeds.behold.so/8rLncG8gRsaqP9kFJR2M';

    try {
        const response = await fetch(BEHOLD_URL, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 3600 } // Guarda en caché la respuesta durante 1 hora
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor de Behold: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error en API Route /api/behold:', error);
        return NextResponse.json({ error: 'No se pudieron obtener las imágenes de Instagram' }, { status: 500 });
    }
}