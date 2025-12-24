# ⚠️ AÇÃO NECESSÁRIA: Atualizar Senha em Produção

## Status Atual

✅ **Banco de Dados Local**: Senha atualizada para `IsaManu@14`
✅ **Código (seed.ts)**: Atualizado e commitado
❌ **Banco de Dados Produção**: **AINDA NÃO ATUALIZADO**

## O Problema

A senha foi alterada no código e no banco de dados **local**, mas o banco de dados de **produção** (Supabase) ainda tem a senha antiga (`password`).

## Como Resolver

Você tem 3 opções:

### Opção 1: Usar Prisma Studio (Recomendado) 🎯

1. Acesse o Prisma Studio em produção:
   ```bash
   cd web
   npx prisma studio --schema=./prisma/schema.prisma
   ```

2. Na interface do Prisma Studio:
   - Clique na tabela `User`
   - Encontre o usuário `admin@andreia.com`
   - Clique para editar
   - Altere o campo `password` para: `IsaManu@14`
   - Salve as alterações

### Opção 2: Executar SQL Direto no Supabase 🔧

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá para o seu projeto
3. Clique em "SQL Editor"
4. Execute o seguinte comando:

```sql
UPDATE "User" 
SET password = 'IsaManu@14' 
WHERE email = 'admin@andreia.com';
```

### Opção 3: Rodar o Seed em Produção 🌱

Se houver uma configuração de seed em produção:

```bash
cd web
# Certifique-se de que DATABASE_URL aponta para produção
npx prisma db seed
```

⚠️ **CUIDADO**: Isso pode resetar outros dados se o seed fizer mais do que só criar o usuário admin.

## Credenciais Atualizadas

### Ambiente Local
- **Email:** `admin@andreia.com`
- **Senha:** `IsaManu@14` ✅

### Ambiente Produção (https://agendador-andreia.vercel.app)
- **Email:** `admin@andreia.com`
- **Senha:** `password` ⚠️ (PRECISA SER ATUALIZADA)

---

**Próxima Ação**: Escolha uma das opções acima para sincronizar a senha em produção.
