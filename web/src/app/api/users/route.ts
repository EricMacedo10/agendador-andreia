
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
}

export async function POST(req: Request) {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: In production, hash this!
                role: role || "USER"
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
