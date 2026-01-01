import React, { useState, FormEvent } from 'react';
import { XIcon } from './icons/XIcon';

interface ChangePasswordModalProps {
    onClose: () => void;
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onChangePassword }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        const result = await onChangePassword(currentPassword, newPassword);
        setIsLoading(false);

        if (result.success) {
            setSuccessMessage(result.message);
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setError(result.message);
        }
    };
    
    const inputClasses = "w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition";
    const labelClasses = "block text-md font-semibold text-gray-700 dark:text-gray-300";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display">Alterar Senha</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {successMessage ? (
                         <div className="text-center py-4">
                            <p className="font-semibold text-green-500">{successMessage}</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="current-password" className={labelClasses}>Senha Atual</label>
                                <input
                                    type="password"
                                    id="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="new-password" className={labelClasses}>Nova Senha</label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className={labelClasses}>Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={inputClasses}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
