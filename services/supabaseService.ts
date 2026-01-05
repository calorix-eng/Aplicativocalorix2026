
import { createClient } from '@supabase/supabase-js';

// Fallback direto para os valores fornecidos caso a injeção do process.env falhe no ambiente de execução
const supabaseUrl = process.env.SUPABASE_URL || 'https://xmlsbkiahzmrtsautoqk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sbp_cba6b68afdced5f855b8096bfbc5fa1e24f3092a';

/**
 * Cliente Supabase inicializado com tratamento de erro básico.
 */
if (!supabaseUrl || !supabaseKey) {
    console.error("Erro crítico: SUPABASE_URL ou SUPABASE_KEY não foram definidos.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Funções utilitárias de exemplo para o banco de dados
export const saveDailyLog = async (userId: string, date: string, log: any) => {
    try {
        // Tenta realizar o upsert. Nota: a tabela 'daily_logs' deve existir no seu banco.
        const { data, error } = await supabase
            .from('daily_logs')
            .upsert({ 
                user_id: userId, 
                date: date, 
                content: log 
            }, { onConflict: 'user_id,date' });
        
        if (error) throw error;
        return data;
    } catch (err) {
        console.warn("Supabase Save Error (Verifique se a tabela 'daily_logs' existe):", err);
        throw err;
    }
};

export const fetchUserLogs = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Supabase Fetch Error:", err);
        throw err;
    }
};
