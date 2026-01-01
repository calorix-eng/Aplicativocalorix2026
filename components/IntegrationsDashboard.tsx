
import React, { useState, useMemo } from 'react';
import { UserProfile, HealthIntegration, SyncLog, HealthMetrics } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';
import { LinkIcon } from './icons/LinkIcon';
import { XIcon } from './icons/XIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { GoogleFitIcon } from './icons/GoogleFitIcon';
import { AppleHealthIcon } from './icons/AppleHealthIcon';
import { SmartwatchIcon } from './icons/SmartwatchIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface IntegrationsDashboardProps {
    userProfile: UserProfile;
    onUpdateIntegrations: (data: Partial<UserProfile['integrations']>) => void;
    showToast: (message: string) => void;
}

const INTEGRATION_LIST: HealthIntegration[] = [
    // Apps
    { id: 'gfit', name: 'Google Fit', type: 'app', iconType: 'google-fit', connected: false, description: 'Sincronize passos, treinos e peso do Google.' },
    { id: 'apple', name: 'Apple Health', type: 'app', iconType: 'apple-health', connected: false, description: 'Conecte-se ao ecossistema de saúde da Apple.' },
    { id: 'samsung', name: 'Samsung Health', type: 'app', iconType: 'samsung-health', connected: false, description: 'Dados de passos e sono do seu Galaxy.' },
    { id: 'strava', name: 'Strava', type: 'app', iconType: 'strava', connected: false, description: 'Importe suas corridas, pedais e trilhas.' },
    { id: 'fitbit_app', name: 'Fitbit App', type: 'app', iconType: 'fitbit', connected: false, description: 'Sincronize sua conta Fitbit completa.' },
    { id: 'nike', name: 'Nike Run Club', type: 'app', iconType: 'nike', connected: false, description: 'Traga seus treinos de corrida da Nike.' },
    { id: 'mfp', name: 'MyFitnessPal', type: 'app', iconType: 'mfp', connected: false, description: 'Sincronize calorias e macros básicos.' },
    
    // Devices
    { id: 'xiaomi', name: 'Xiaomi Smart Band', type: 'device', iconType: 'xiaomi', connected: false, description: 'Mi Band 5, 6, 7 e novas gerações.' },
    { id: 'amazfit', name: 'Amazfit / Zepp', type: 'device', iconType: 'amazfit', connected: false, description: 'Relógios GTR, GTS e Bip.' },
    { id: 'garmin', name: 'Garmin Connect', type: 'device', iconType: 'garmin', connected: false, description: 'Forerunner, Fenix e dispositivos Garmin.' },
    { id: 'huawei', name: 'Huawei Watch Fit', type: 'device', iconType: 'huawei', connected: false, description: 'Huawei Band e Watch Series.' },
];

const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = ({ userProfile, onUpdateIntegrations, showToast }) => {
    const [activeTab, setActiveTab] = useState<'app' | 'device'>('app');
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const connectedServices = useMemo(() => userProfile.integrations?.connectedServices || [], [userProfile.integrations]);

    const handleConnect = (service: HealthIntegration) => {
        setIsConnecting(service.id);
        // Simulando fluxo OAuth
        setTimeout(() => {
            const updatedConnected = [...connectedServices, service.id];
            onUpdateIntegrations({ connectedServices: updatedConnected });
            setIsConnecting(null);
            showToast(`${service.name} conectado com sucesso!`);
        }, 1500);
    };

    const handleDisconnect = (id: string) => {
        const updatedConnected = connectedServices.filter(sid => sid !== id);
        onUpdateIntegrations({ connectedServices: updatedConnected });
        showToast("Serviço desconectado.");
    };

    const handleSyncNow = () => {
        if (connectedServices.length === 0) {
            showToast("Conecte um serviço para sincronizar.");
            return;
        }
        setIsSyncing(true);
        setTimeout(() => {
            const now = Date.now();
            const newLogs: SyncLog[] = [
                { id: Math.random().toString(), timestamp: now, serviceName: 'Múltiplos', dataType: 'Passos', value: '8.452' },
                { id: Math.random().toString(), timestamp: now, serviceName: 'Múltiplos', dataType: 'Calorias Queimadas', value: '420 kcal' },
                { id: Math.random().toString(), timestamp: now, serviceName: 'Múltiplos', dataType: 'Sono', value: '7h 12m' },
            ];
            
            const dummyMetrics: HealthMetrics = {
                steps: 8452,
                sleepMinutes: 432,
                heartRateAvg: 68,
                spo2: 98,
                stressLevel: 25,
                weight: userProfile.weight
            };

            onUpdateIntegrations({ 
                syncHistory: [...newLogs, ...(userProfile.integrations?.syncHistory || [])].slice(0, 20),
                metrics: dummyMetrics
            });
            
            setIsSyncing(false);
            showToast("Seus dados foram sincronizados com sucesso! 🚀");
        }, 2000);
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'google-fit': return <GoogleFitIcon className="w-10 h-10" />;
            case 'apple-health': return <AppleHealthIcon className="w-10 h-10" />;
            default: return <SmartwatchIcon className="w-10 h-10 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-display flex items-center">
                        <LinkIcon className="mr-3 text-accent-green" />
                        Integrações Fitness
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Conecte seus aparelhos e apps para automatizar seu progresso.</p>
                </div>
                <button 
                    onClick={handleSyncNow}
                    disabled={isSyncing || connectedServices.length === 0}
                    className="flex items-center space-x-2 bg-accent-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50 shadow-lg"
                >
                    <RefreshIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-bold">Privacidade em primeiro lugar:</span> Ao conectar, você autoriza o calorix a ler apenas dados de saúde necessários para suas metas. Você pode revogar o acesso a qualquer momento.
                </p>
            </div>

            <div className="flex space-x-2 border-b dark:border-gray-700">
                <button 
                    onClick={() => setActiveTab('app')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'app' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500'}`}
                >
                    Aplicativos
                </button>
                <button 
                    onClick={() => setActiveTab('device')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'device' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500'}`}
                >
                    Dispositivos & Wearables
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INTEGRATION_LIST.filter(i => i.type === activeTab).map(item => {
                    const isConnected = connectedServices.includes(item.id);
                    const isLoading = isConnecting === item.id;

                    return (
                        <Card key={item.id} className={`transition-all ${isConnected ? 'ring-2 ring-green-500/20 border-green-500/30 bg-green-50/10' : ''}`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    {renderIcon(item.iconType)}
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                        {isConnected ? 'Conectado' : 'Desconectado'}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold mt-4">{item.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 h-8">{item.description}</p>
                                
                                <div className="mt-6">
                                    {isConnected ? (
                                        <button 
                                            onClick={() => handleDisconnect(item.id)}
                                            className="w-full text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition"
                                        >
                                            Desconectar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleConnect(item)}
                                            disabled={isLoading}
                                            className="w-full bg-accent-green text-white py-2 rounded-lg font-bold hover:bg-green-600 transition shadow-md disabled:opacity-50"
                                        >
                                            {isLoading ? 'Autorizando...' : 'Conectar'}
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {connectedServices.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Dados Sincronizados de Hoje</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <MetricBox label="Passos" value={userProfile.integrations?.metrics?.steps || 0} unit="passos" icon="👣" />
                                <MetricBox label="Sono" value={Math.floor((userProfile.integrations?.metrics?.sleepMinutes || 0) / 60)} unit="horas" icon="🌙" />
                                <MetricBox label="Frequência Card." value={userProfile.integrations?.metrics?.heartRateAvg || 0} unit="bpm" icon="❤️" />
                                <MetricBox label="SpO2" value={userProfile.integrations?.metrics?.spo2 || 0} unit="%" icon="💨" />
                                <MetricBox label="Estresse" value={userProfile.integrations?.metrics?.stressLevel || 0} unit="/100" icon="⚡" />
                                <MetricBox label="Peso" value={userProfile.integrations?.metrics?.weight || userProfile.weight} unit="kg" icon="⚖️" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Histórico de Sincronização</CardTitle></CardHeader>
                        <CardContent className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                            {(!userProfile.integrations?.syncHistory || userProfile.integrations.syncHistory.length === 0) ? (
                                <p className="text-center text-gray-500 text-sm py-10">Nenhum dado sincronizado.</p>
                            ) : (
                                userProfile.integrations.syncHistory.map(log => (
                                    <div key={log.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="font-bold">{log.dataType}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</p>
                                        </div>
                                        <span className="font-mono font-bold text-accent-blue">{log.value}</span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

const MetricBox = ({ label, value, unit, icon }: { label: string, value: number | string, unit: string, icon: string }) => (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border dark:border-gray-700">
        <span className="text-2xl mb-1 block">{icon}</span>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold mt-1">{value} <span className="text-[10px] text-gray-400 font-normal">{unit}</span></p>
    </div>
);

export default IntegrationsDashboard;
