import React, { useState, FormEvent } from 'react';
import { Reminder } from '../types';
import { XIcon } from './icons/XIcon';
import { BellIcon } from './icons/BellIcon';
import { getDefaultReminders } from '../utils/reminderUtils';

interface RemindersModalProps {
    reminders: Reminder[];
    onClose: () => void;
    onSave: (reminders: Reminder[]) => void;
}

const RemindersModal: React.FC<RemindersModalProps> = ({ reminders: initialReminders, onClose, onSave }) => {
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders || getDefaultReminders());

    const handleReminderChange = (id: string, field: keyof Reminder, value: any) => {
        if (field === 'enabled' && value === true && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setReminders(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(reminders);
        onClose();
    };

    const inputClasses = "w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display">Lembretes</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <div className="p-6 overflow-y-auto space-y-4 flex-grow">
                        <div className="flex items-start mb-4">
                            <BellIcon className="w-6 h-6 mr-3 text-accent-green flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold">Gerenciar Lembretes</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ative lembretes para ajudar a manter seus hábitos. As notificações são enviadas pelo seu navegador.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {reminders.map(reminder => (
                                <div key={reminder.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor={`reminder-toggle-${reminder.id}`} className="font-semibold cursor-pointer">{reminder.label}</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id={`reminder-toggle-${reminder.id}`} className="sr-only peer" checked={reminder.enabled} onChange={e => handleReminderChange(reminder.id, 'enabled', e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-green/30 dark:peer-focus:ring-accent-green/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-green"></div>
                                        </label>
                                    </div>
                                    {reminder.enabled && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            {reminder.time && !reminder.interval && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Horário:</label>
                                                    <input type="time" value={reminder.time} onChange={e => handleReminderChange(reminder.id, 'time', e.target.value)} className={inputClasses + " mt-1"} />
                                                </div>
                                            )}
                                            {reminder.interval && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Frequência:</label>
                                                    <select value={reminder.interval} onChange={e => handleReminderChange(reminder.id, 'interval', parseInt(e.target.value))} className={inputClasses + " mt-1"}>
                                                        <option value={1}>A cada 1 hora</option>
                                                        <option value={2}>A cada 2 horas</option>
                                                        <option value={3}>A cada 3 horas</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition">Salvar Lembretes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RemindersModal;
