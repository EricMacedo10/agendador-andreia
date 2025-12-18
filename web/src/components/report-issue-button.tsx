"use client";

import { useState } from "react";
import { Bug, X, Send } from "lucide-react";

export function ReportIssueButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("idle");

        try {
            const response = await fetch("/api/report-issue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description }),
            });

            if (!response.ok) throw new Error("Failed to submit");

            setStatus("success");
            setTitle("");
            setDescription("");
            setTimeout(() => {
                setIsOpen(false);
                setStatus("idle");
            }, 2000);
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-700 active:scale-95 dark:bg-red-500 dark:hover:bg-red-600"
                title="Reportar Bug"
            >
                <Bug size={24} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                Reportar Bug
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {status === "success" ? (
                            <div className="flex flex-col items-center justify-center py-8 text-green-600 dark:text-green-400">
                                <p className="text-lg font-semibold">Enviado com sucesso!</p>
                                <p className="text-sm">Obrigado pelo seu feedback.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                    >
                                        Título
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                        placeholder="Ex: Erro ao salvar serviço"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                    >
                                        Descrição
                                    </label>
                                    <textarea
                                        id="description"
                                        required
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                        placeholder="Descreva o que aconteceu..."
                                    />
                                </div>

                                {status === "error" && (
                                    <p className="text-sm text-red-600">
                                        Erro ao enviar. Tente novamente.
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    {isSubmitting ? (
                                        "Enviando..."
                                    ) : (
                                        <>
                                            <Send size={16} /> Enviar Report
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
