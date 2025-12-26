import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// TEMPORARY ENDPOINT - DELETE AFTER USE
export async function GET() {
    try {
        // Create admin user directly in production database
        const admin = await prisma.user.upsert({
            where: { email: 'admin@info.com' },
            update: {},
            create: {
                name: 'Admin',
                email: 'admin@info.com',
                password: 'Icabanu@14',
                role: 'ADMIN'
            }
        });

        // Also create Andreia's admin
        const andreia = await prisma.user.upsert({
            where: { email: 'admin@deia.com' },
            update: {},
            create: {
                name: 'Andreia',
                email: 'admin@deia.com',
                password: 'IsaManu@14',
                role: 'ADMIN'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Admins criados em PRODUÇÃO!',
            users: [
                { email: admin.email, id: admin.id, role: admin.role },
                { email: andreia.email, id: andreia.id, role: andreia.role }
            ]
        });

    } catch (error) {
        console.error('Error creating admins:', error);
        return NextResponse.json(
            { error: 'Erro ao criar admins', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
