import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PaymentReminder } from "@/components/payment-reminder";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            {/* Sidebar para Desktop */}
            <Sidebar />

            {/* Conteúdo Principal */}
            <main className="flex-1 pb-20 md:pb-0 relative flex flex-col">
                <PaymentReminder />
                <div className="mx-auto max-w-5xl p-4 md:p-8 flex-1 w-full flex flex-col">
                    {children}
                </div>
            </main>

            {/* Navegação Mobile (Bottom Bar) */}
            <MobileNav />
        </div>
    );
}
