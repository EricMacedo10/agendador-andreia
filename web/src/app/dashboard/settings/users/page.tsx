
"use client";

import { useState, useEffect } from "react";
import { Trash2, UserPlus, Shield, User } from "lucide-react";

type UserType = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    createdAt: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                fetchUsers();
                setIsModalOpen(false);
                setNewUser({ name: "", email: "", password: "", role: "USER" });
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert("Erro ao criar usuário");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este usuário?")) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert("Erro ao deletar usuário");
        }
    };

    if (isLoading) return <div className="p-6">Carregando usuários...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                        <Shield className="text-emerald-600" /> Gestão de Usuários
                    </h1>
                    <p className="text-zinc-500">Controle quem tem acesso ao sistema</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                    <UserPlus size={20} /> Novo Usuário
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {user.role === 'ADMIN' ? <Shield size={24} /> : <User size={24} />}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                                    {user.role}
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-zinc-900">{user.name}</h3>
                            <p className="text-zinc-500 text-sm break-all">{user.email}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Remover Usuário"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">Nome</label>
                                <input
                                    required
                                    className="w-full border rounded-lg p-2"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full border rounded-lg p-2"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">Senha</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full border rounded-lg p-2"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">Permissão</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as "USER" | "ADMIN" })}
                                >
                                    <option value="USER">Usuário (Acesso Padrão)</option>
                                    <option value="ADMIN">Administrador (Total)</option>
                                </select>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-zinc-100 text-zinc-700 py-2 rounded-lg font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold"
                                >
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
