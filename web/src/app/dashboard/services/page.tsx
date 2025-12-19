"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, Upload } from "lucide-react";

type Service = {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    visible: boolean;
    imageUrl?: string | null;
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "30",
        visible: true,
        imageUrl: "",
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price.toString(),
            duration: service.duration.toString(),
            visible: service.visible,
            imageUrl: service.imageUrl || "",
        });
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
            const method = editingService ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingService(null);
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    duration: "30",
                    visible: true,
                    imageUrl: "",
                });
                fetchServices();
            }
        } catch (error) {
            console.error("Failed to save service", error);
        }
    };

    const toggleVisibility = async (id: string, current: boolean) => {
        // Optimistic update
        const updated = services.map(s => s.id === id ? { ...s, visible: !current } : s);
        setServices(updated);

        try {
            const service = services.find(s => s.id === id);
            if (!service) return;

            // We use the same PUT endpoint but only update one field override
            // For simplicity, we can just send the full object or patch
            // Our API likely validates body key presence
            await fetch(`/api/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...service, visible: !current })
            });
        } catch (err) {
            fetchServices(); // Revert on error
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

        try {
            await fetch(`/api/services/${id}`, { method: 'DELETE' });
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto text-zinc-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-yellow-500">Serviços</h1>
                    <p className="text-zinc-400">Gerencie seus procedimentos e valores</p>
                </div>
                <button
                    onClick={() => {
                        setEditingService(null);
                        setFormData({
                            name: "",
                            description: "",
                            price: "",
                            duration: "30",
                            visible: true,
                            imageUrl: "",
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Novo Serviço
                </button>
            </div>

            <div className="grid gap-4">
                {isLoading ? <p>Carregando...</p> : services.map((service) => (
                    <div
                        key={service.id}
                        className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {service.imageUrl ? (
                                <img
                                    src={service.imageUrl}
                                    alt={service.name}
                                    className="w-16 h-16 rounded-lg object-cover border border-zinc-700 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 border border-zinc-700 flex-shrink-0">
                                    <ImageIcon size={24} />
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg truncate">{service.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${service.visible ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                        {service.visible ? 'Visível' : 'Oculto'}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm mt-1 truncate">{service.description}</p>
                                <div className="text-yellow-500 mt-2 font-medium truncate">
                                    R$ {Number(service.price).toFixed(2)} • {service.duration} min
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(service); }} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white" title="Editar">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleVisibility(service.id, service.visible); }} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white" title="Alternar Visibilidade">
                                {service.visible ? <Check size={18} /> : <X size={18} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }} className="p-2 hover:bg-red-900/20 rounded-lg text-zinc-400 hover:text-red-500" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {!isLoading && services.length === 0 && (
                    <div className="text-center py-10 text-zinc-500">Nenhum serviço cadastrado.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-white">{editingService ? "Editar Serviço" : "Novo Serviço"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Foto do Serviço</label>
                                <div className="flex items-center gap-4">
                                    {formData.imageUrl ? (
                                        <div className="relative w-20 h-20">
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border border-zinc-600" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-20 h-20 flex flex-col items-center justify-center bg-zinc-950 border border-zinc-700 border-dashed rounded-lg cursor-pointer hover:border-yellow-500 hover:text-yellow-500 text-zinc-500 transition-colors">
                                            <Upload size={20} />
                                            <span className="text-[10px] mt-1">Foto</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                    <div className="text-xs text-zinc-500 flex-1">
                                        Carregue uma imagem (PNG/JPG) para ilustrar o serviço.
                                        Ideal: Quadrada.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nome do Serviço</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-black font-bold focus:outline-none focus:border-yellow-600 placeholder:text-zinc-400"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Corte de Cabelo"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Preço (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-black font-bold focus:outline-none focus:border-yellow-600 placeholder:text-zinc-400"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Duração (min)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-black font-bold focus:outline-none focus:border-yellow-600 placeholder:text-zinc-400"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                                <textarea
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-black font-bold focus:outline-none focus:border-yellow-600 h-20 placeholder:text-zinc-400"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalhes do serviço..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.visible} onChange={(e) => setFormData({ ...formData, visible: e.target.checked })} id="visible" className="accent-yellow-500 w-5 h-5" />
                                <label htmlFor="visible" className="text-sm">Mostrar no agendamento online</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingService(null);
                                    }}
                                    className="px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
