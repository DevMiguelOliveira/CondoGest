const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração da conexão (Mesma do setup-db.js, que funcionou)
// Senha: @Lm30139771 (%40)
const password = encodeURIComponent('@Lm30139771');
const connectionString = `postgresql://postgres:${password}@db.uifwafiicunnksgrntgh.supabase.co:5432/postgres`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runFix() {
    try {
        console.log('🔌 Conectando para aplicar permissões...');
        await client.connect();

        // Ler o arquivo SQL de permissões
        const sqlPath = path.join(__dirname, '../supabase/seed/fix_permissions.sql');
        console.log(`📂 Lendo script SQL: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Aplicando GRANTs e corrigindo roles...');
        await client.query(sql);

        console.log('✅ SUCESSO! Permissões corrigidas.');
        console.log('👉 Agora tente rodar o sistema e/ou o script test-connection.js novamente.');

    } catch (err) {
        console.error('❌ Erro ao aplicar permissões:', err);
    } finally {
        await client.end();
    }
}

runFix();
