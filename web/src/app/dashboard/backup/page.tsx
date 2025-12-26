'use client';

import { useState } from 'react';
import { Calendar, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BackupPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setMessage(null);

            const response = await fetch('/api/backup/export');

            if (!response.ok) {
                throw new Error('Erro ao exportar backup');
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'backup.json';

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setMessage({
                type: 'success',
                text: 'Backup exportado com sucesso!'
            });

        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erro ao exportar backup'
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            // Confirm restoration
            if (!window.confirm('⚠️ ATENÇÃO: Restaurar um backup irá APAGAR todos os dados atuais e substituir pelos dados do backup. Deseja continuar?')) {
                event.target.value = '';
                return;
            }

            setIsRestoring(true);
            setMessage(null);

            const text = await file.text();
            const backup = JSON.parse(text);

            const response = await fetch('/api/backup/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backup)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao restaurar backup');
            }

            setMessage({
                type: 'success',
                text: `Backup restaurado! ${result.restored.clients} clientes, ${result.restored.services} serviços, ${result.restored.appointments} agendamentos`
            });

            // Reload page to show new data
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erro ao restaurar backup'
            });
        } finally {
            setIsRestoring(false);
            event.target.value = '';
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Backup e Restauração</h1>
                <p className="text-gray-600">
                    Faça backup regular dos seus dados ou restaure de um backup anterior
                </p>
            </div>

            {/* Alert Box */}
            <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-yellow-800 mb-1">Importante</h3>
                        <p className="text-sm text-yellow-700">
                            Recomendamos fazer backup <strong>antes de qualquer alteração importante</strong> no sistema.
                            Restaurar um backup irá substituir todos os dados atuais.
                        </p>
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="flex items-center">
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 mr-2" />
                        )}
                        <p>{message.text}</p>
                    </div>
                </div>
            )}

            {/* Export Backup */}
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
                <div className="flex items-start mb-4">
                    <Download className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2">Exportar Backup</h2>
                        <p className="text-gray-600 mb-4">
                            Baixe um arquivo JSON com todos os dados atuais do sistema (clientes, agendamentos, serviços, etc.)
                        </p>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {isExporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Fazer Backup Agora
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Restore Backup */}
            <div className="p-6 bg-white rounded-lg shadow-sm border">
                <div className="flex items-start">
                    <Upload className="w-6 h-6 text-green-600 mr-3 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2">Restaurar Backup</h2>
                        <p className="text-gray-600 mb-4">
                            Selecione um arquivo de backup (JSON) para restaurar os dados
                        </p>
                        <label className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors inline-flex items-center cursor-pointer">
                            {isRestoring ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Restaurando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Escolher Arquivo de Backup
                                </>
                            )}
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestore}
                                disabled={isRestoring}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Automatic Backup Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Backup Automático</h3>
                        <p className="text-sm text-blue-800">
                            O sistema faz backup automático todos os dias à meia-noite via cron-job.org.
                            Mesmo assim, recomendamos fazer backups manuais antes de alterações importantes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
