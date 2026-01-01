import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface PrivacyPolicyProps {
    onAccept: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onAccept }) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center text-center mb-6">
                    <LogoIcon />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display mt-4">Política de Privacidade</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Por favor, leia e aceite nossos termos para continuar.</p>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none h-64 overflow-y-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 text-light-text dark:text-dark-text">
                    <h2>1. Introdução</h2>
                    <p>Bem-vindo ao calorix. Sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nosso aplicativo.</p>
                    
                    <h2>2. Informações que Coletamos</h2>
                    <p>Podemos coletar informações sobre você de várias maneiras, incluindo:</p>
                    <ul>
                        <li><strong>Informações Pessoais:</strong> Nome, e-mail, idade, sexo, peso, altura e outras informações de perfil que você nos fornece.</li>
                        <li><strong>Dados de Uso:</strong> Informações sobre como você usa o aplicativo, como registros de alimentos, atividades e interações na comunidade.</li>
                        <li><strong>Conteúdo do Usuário:</strong> Fotos, vídeos e textos que você publica na comunidade.</li>
                    </ul>

                    <h2>3. Como Usamos Suas Informações</h2>
                    <p>Usamos as informações coletadas para:</p>
                    <ul>
                        <li>Fornecer, operar e manter nosso aplicativo.</li>
                        <li>Personalizar sua experiência e calcular suas metas nutricionais.</li>
                        <li>Melhorar nosso serviço e desenvolver novos recursos.</li>
                        <li>Processar suas interações e publicações na comunidade.</li>
                        <li>Comunicar com você sobre sua conta ou nosso serviço.</li>
                    </ul>
                    
                    <h2>4. Uso de IA e Dados de Imagem</h2>
                    <p>Nosso aplicativo utiliza APIs de Inteligência Artificial (IA), como o Gemini, para analisar imagens de alimentos e exercícios. Ao usar esses recursos, você concorda que:</p>
                    <ul>
                        <li>As imagens enviadas serão processadas por serviços de IA de terceiros para identificar alimentos e estimar informações nutricionais.</li>
                        <li>Não temos controle sobre o armazenamento ou uso de dados por esses serviços de terceiros. Recomendamos que você não envie imagens com informações sensíveis ou pessoais.</li>
                    </ul>

                    <h2>5. Compartilhamento de Informações</h2>
                    <p>Não compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:</p>
                    <ul>
                        <li>Com seu consentimento.</li>
                        <li>Para cumprir com a lei ou responder a processos legais.</li>
                        <li>Para proteger os direitos e a segurança de nossa empresa, nossos usuários ou o público.</li>
                        <li>Com provedores de serviços que nos ajudam a operar o aplicativo (ex: provedores de IA), que são obrigados a proteger suas informações.</li>
                    </ul>

                    <h2>6. Segurança dos Dados</h2>
                    <p>Implementamos medidas de segurança para proteger suas informações. No entanto, nenhum sistema é 100% seguro, e não podemos garantir a segurança absoluta de suas informações.</p>

                    <h2>7. Seus Direitos</h2>
                    <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar os dados do seu perfil nas configurações do aplicativo.</p>

                    <h2>8. Alterações a esta Política</h2>
                    <p>Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova política no aplicativo.</p>
                </div>

                <div className="mt-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                            className="h-5 w-5 rounded border-gray-300 text-accent-green focus:ring-accent-green"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Eu li, entendi e aceito a Política de Privacidade.</span>
                    </label>
                </div>

                <div className="mt-6">
                    <button
                        onClick={onAccept}
                        disabled={!isChecked}
                        className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
