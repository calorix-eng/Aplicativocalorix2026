import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const CommunityGuidelines: React.FC = () => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-accent-blue mr-3" />
                <h1 className="text-3xl font-bold font-display text-gray-800 dark:text-white">Diretrizes da Comunidade</h1>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-light-text dark:text-dark-text space-y-4">
                <p>Para manter o calorix um lugar seguro, positivo e útil para todos, pedimos que você siga estas diretrizes:</p>
                
                <div>
                    <h3 className="font-bold">1. Seja Respeitoso e Gentil</h3>
                    <p>Trate todos os membros com respeito. Não toleramos assédio, bullying, discurso de ódio, ou qualquer tipo de discriminação, incluindo, mas não se limitando a, racismo, homofobia, transfobia, xenofobia, ou qualquer outra forma de preconceito.</p>
                </div>
                
                <div>
                    <h3 className="font-bold">2. Mantenha o Foco</h3>
                    <p>O conteúdo deve ser relevante para saúde, fitness, nutrição, bem-estar e o uso do aplicativo. Tópicos não relacionados podem ser removidos.</p>
                </div>

                <div>
                    <h3 className="font-bold">3. Cuidado com Conselhos Médicos</h3>
                    <p>Compartilhar experiências é ótimo, mas evite dar ou pedir conselhos médicos. Para questões de saúde, sempre consulte um profissional qualificado.</p>
                </div>
                
                <div>
                    <h3 className="font-bold">4. Sem Spam ou Autopromoção</h3>
                    <p>É proibido postar spam, anúncios comerciais, links de afiliados ou promover excessivamente seus próprios serviços ou produtos.</p>
                </div>

                <div>
                    <h3 className="font-bold">5. Proteja sua Privacidade</h3>
                    <p>Não compartilhe informações pessoais sensíveis, como seu endereço, número de telefone ou dados financeiros.</p>
                </div>

                <div>
                    <h3 className="font-bold">6. Conteúdo Apropriado</h3>
                    <p>Não publique conteúdo que seja sexualmente explícito, violento, ilegal ou que infrinja os direitos autorais de terceiros.</p>
                </div>

                <p className="font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">O descumprimento destas regras pode resultar na remoção do conteúdo ou na suspensão da conta. Agradecemos sua colaboração para tornar nossa comunidade incrível!</p>
            </div>
        </div>
    );
};

export default CommunityGuidelines;