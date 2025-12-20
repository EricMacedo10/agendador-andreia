import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Permitir GET também para facilitar teste no navegador
export async function GET(request: Request) {
    return handleSetup(request);
}

export async function POST(request: Request) {
    return handleSetup(request);
}

async function handleSetup(request: Request) {
    try {
        // Extrair secret da query string ou body
        const url = new URL(request.url);
        const secretFromQuery = url.searchParams.get('secret');

        let secretFromBody = null;
        if (request.method === 'POST') {
            try {
                const body = await request.json();
                secretFromBody = body.secret;
            } catch { }
        }

        const secret = secretFromQuery || secretFromBody;

        // Secret de segurança
        if (secret !== 'create-admin-andreia-2024') {
            return NextResponse.json({ error: 'Unauthorized - Invalid secret' }, { status: 401 });
        }

        const email = 'admin@agendador.com';
        const password = 'Andreia2024!';
        const name = 'Admin';

        // Deletar usuário existente se houver
        await prisma.user.deleteMany({
            where: { email }
        });

        // Criar novo usuário
        const user = await prisma.user.create({
            data: {
                email,
                password,
                name,
                role: 'ADMIN'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Admin user created successfully! 🎉',
            credentials: {
                email: user.email,
                password: password,
                loginUrl: 'https://agendador-andreia.vercel.app'
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to create admin user',
            details: error.message
        }, { status: 500 });
    }
}
