require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis URL ou Anon Key não encontradas!');
    process.exit(1);
}

// 1. Teste com Anon Key (Público)
console.log('\n🔵 Testando com CHAVE PÚBLICA (Anon Key)...');
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

supabaseAnon.from('condominios').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
        if (error) {
            console.error('❌ Anon Key falhou:', error.message);
        } else {
            console.log(`✅ Anon Key OK! Acesso à tabela condominios. Contagem: ${count}`);
        }

        // 2. Teste com Service Role Key (Admin)
        if (supabaseServiceKey) {
            console.log('\n🔴 Testando com CHAVE SECRETA (Service Role)...');
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

            return supabaseAdmin.from('usuarios').select('*').limit(1);
        } else {
            console.log('\n⚠️ Service Role Key não definida no .env.local');
            return Promise.resolve(null);
        }
    })
    .then((res) => {
        if (res) {
            const { data, error } = res;
            if (error) {
                console.error('❌ Service Role Key falhou:', error.message);
            } else {
                console.log('✅ Service Role Key OK! Acesso total permitido.');
            }
        }
    })
    .catch(err => {
        console.error('💥 Erro fatal:', err);
    });
