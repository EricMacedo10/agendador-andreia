import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user with FCM token
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                fcmToken: true,
                email: true
            }
        });

        if (!user?.fcmToken) {
            return NextResponse.json({
                error: "No FCM token found",
                instructions: "Click 'Ativar Notificações' button first"
            }, { status: 400 });
        }

        // Send test notification
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: user.fcmToken,
                title: '🧪 Teste de Notificação',
                body: 'Se você recebeu isso, as notificações estão funcionando! ✅',
                data: {
                    testId: Date.now().toString()
                }
            })
        });

        const result = await response.json();

        return NextResponse.json({
            success: true,
            tokenExists: true,
            userEmail: user.email,
            sendResult: result
        });
    } catch (error) {
        console.error("Error in test notification:", error);
        return NextResponse.json(
            {
                error: "Failed to send test notification",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
