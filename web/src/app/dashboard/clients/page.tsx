"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Phone, Edit2, Trash2, X, User } from "lucide-react";
import Link from "next/link";

type Client = {
    id: string;
    name: string;
    phone: string;
};

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch(`/api/clients?t=${new Date().getTime()}`);
            const data = await res.json();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

        try {
            await fetch(`/api/clients/${id}`, { method: 'DELETE' });
            fetchClients();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
            const method = editingClient ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingClient(null);
                setFormData({ name: "", phone: "" });
                fetchClients();
            }
        } catch (error) {
            console.error("Failed to save client", error);
        }
    };

    const filteredClients = clients
        .filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        )
        .sort((a, b) => a.name.localeCompare(b.name));


    return (
        <div className="space-y-6 text-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-rose-600">Clientes</h1>
                    <p className="text-zinc-500 text-sm">Gerencie sua base de clientes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClient(null);
                        setFormData({ name: "", phone: "" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 shadow-lg shadow-rose-200 transition-transform hover:scale-105"
                >
                    <UserPlus className="h-4 w-4" />
                    Novo Cliente
                </button>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-sm"
                />
            </div>

            {/* Lista de Clientes */}
            <div className="space-y-2">
                {isLoading ? <p className="text-center text-zinc-500">Carregando...</p> : filteredClients.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-zinc-500">
                        Nenhum cliente encontrado.
                    </div>
                ) : (
                    filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-rose-200 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Link href={`/dashboard/clients/${client.id}`} className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-lg hover:bg-rose-200 transition-colors">
                                    {client.name.charAt(0).toUpperCase()}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/dashboard/clients/${client.id}`} className="block font-bold text-zinc-900 text-lg hover:text-rose-600 transition-colors truncate">
                                        {client.name}
                                    </Link>
                                    <div className="flex items-center gap-1 text-sm text-zinc-500 font-medium">
                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{client.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors" title="Editar">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors" title="Excluir">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
                    <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-zinc-900">{editingClient ? "Editar Cliente" : "Novo Cliente"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-rose-600 bg-zinc-100 rounded-full p-2 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <User size={16} className="text-rose-500" /> Nome Completo
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:text-zinc-400"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Maria Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <Phone size={16} className="text-rose-500" /> Telefone (Whatsapp)
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:text-zinc-400"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                            >
                                {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
