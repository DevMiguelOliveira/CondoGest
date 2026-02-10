const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração da conexão
// O usuário informou que a senha é: @Lm30139771
// Caracteres especiais na senha devem ser percent-encoded na connection string
// @ -> %40
const password = encodeURIComponent('@Lm30139771');
const connectionString = `postgresql://postgres:${password}@db.uifwafiicunnksgrntgh.supabase.co:5432/postgres`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Necessário para Supabase
});

async function runSetup() {
    try {
        console.log('🔌 Conectando ao Supabase...');
        await client.connect();
        console.log('✅ Conectado!');

        // Ler o arquivo SQL mestre
        const sqlPath = path.join(__dirname, '../supabase/seed/master_setup.sql');
        console.log(`📂 Lendo script SQL de: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executando Master Setup (Reset Schema + Create Tables + Admin)...');

        // Executar o SQL
        await client.query(sql);

        console.log('🎉 SUCESSO! Banco de dados resetado e configurado.');
        console.log('🔑 Admin criado: admin@condogest.com / Admin@2026!');

    } catch (err) {
        console.error('❌ Erro ao executar setup:', err);
        if (err.code === '28P01') {
            console.error('🔒 A senha do banco continua incorreta.');
            console.error('💡 Dica: Verifique se sua senha realmente começa com "@" ou se você digitou "@" apenas para mencionar.');
            console.error('💡 Reset a senha em: https://supabase.com/dashboard/project/uifwafiicunnksgrntgh/settings/database');
        }
    } finally {
        await client.end();
    }
}

runSetup();
