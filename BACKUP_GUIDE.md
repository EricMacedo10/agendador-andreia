# 🔄 Sistema de Backup e Restauração - Guia Completo

## 📋 Visão Geral

Sistema automático de backup que protege todos os dados do Agendador Andreia contra perda acidental.

---

## 🎯 Funcionalidades

### ✅ **Backup Manual**
- **Onde:** Dashboard → Menu lateral → **Backup**
- **Quem:** Apenas usuários ADMIN
- **O que faz:** Exporta todos os dados para arquivo JSON
- **Dados incluídos:**
  - Clientes
  - Serviços 
  - Agendamentos (com histórico completo)
  - Configurações do negócio

### ✅ **Restauração Manual**
- **Onde:** Mesma página de Backup
- **Como:** Upload do arquivo JSON de backup
- **Ação:** Substitui todos os dados atuais pelo backup
- **Segurança:** Confirmação obrigatória antes de restaurar

### ⏰ **Backup Automático** (Planejado)
- **Frequência:** Diário (meia-noite)
- **Método:** Cron-job.org chama endpoint de export
- **Status:** Aguardando configuração manual

---

## 🚀 Como Usar

### **1. Fazer Backup Agora** ⬇️

1. Faça login como ADMIN
2. Vá para **Dashboard** → **Backup** (menu lateral)
3. Clique em **"Fazer Backup Agora"**
4. Arquivo JSON será baixado automaticamente
5. **Nome do arquivo:** `backup-agendador-YYYY-MM-DD.json`
6. **Salve em local seguro!** (Google Drive, Dropbox, etc.)

### **2. Restaurar de Backup** ⬆️

1. Vá para **Dashboard** → **Backup**
2. Clique em **"Escolher Arquivo de Backup"**
3. Selecione um arquivo `.json` de backup
4. **⚠️ CONFIRME A AÇÃO** (irá apagar dados atuais!)
5. Aguarde conclusão
6. Página recarrega automaticamente

---

## ⚠️ **AVISOS IMPORTANTES**

### 🔴 **Antes de Restaurar**

> **ATENÇÃO:** Restaurar um backup irá **APAGAR TODOS OS DADOS ATUAIS** e substituir pelos dados do backup!

**Quando restaurar:**
- ✅ Perda acidental de dados
- ✅ Erro em migração/atualização
- ✅ Corrupção de dados

**Recomendação:** Faça backup dos dados atuais ANTES de restaurar!

### 🟡 **Boas Práticas**

1. **Backup semanal manual** (mínimo)
2. **Backup antes de:**
   - Alterações importantes
   - Atualizações do sistema
   - Migrações de banco de dados
3. **Guarde backups em:**
   - Google Drive
   - Dropbox
   - HD externo
4. **Mantenha múltiplas versões** (últimas 4-6 semanas)

---

## 🔧 **Endpoints da API**

### **GET /api/backup/export**
- **Auth:** ADMIN only
- **Retorna:** JSON com todos os dados
- **Headers:** `Content-Disposition: attachment`

### **POST /api/backup/restore**
- **Auth:** ADMIN only
- **Body:** JSON de backup completo
- **Ação:** Limpa e restaura dados

---

## 📊 **Formato do Backup (JSON)**

```json
{
  "version": "1.0",
  "timestamp": "2025-12-26T20:00:00.000Z",
  "exportedBy": "admin@example.com",
  "data": {
    "users": [...],
    "clients": [...],
    "services": [...],
    "appointments": [...],
    "businessSettings": [...]
  },
  "stats": {
    "totalUsers": 2,
    "totalClients": 50,
    "totalServices": 10,
    "totalAppointments": 300
  }
}
```

---

## 🛡️ **Segurança**

- ✅ Apenas ADMIN pode fazer backup/restore
- ✅ Rate limiting (previne abuso)
- ✅ Validação de JSON no restore
- ✅ Transações atômicas (tudo ou nada)
- ✅ Senhas NÃO são exportadas

---

## 🔄 **Recuperação de Desastre**

### **Cenário 1: Perda Total de Dados**
1. Faça login (usuário admin ainda existe)
2. Vá para Dashboard → Backup
3. Upload do último backup JSON
4. Confirme restauração
5. ✅ Dados recuperados!

### **Cenário 2: Múltiplos Backups**
- Use o mais recente para recuperação total
- Use backups antigos para auditar mudanças

---

## ❓ **FAQ**

**P: Com que frequência devo fazer backup?**
R: Mínimo semanal. Idealmente, antes de qualquer alteração importante.

**P: Onde guardar os backups?**
R: Google Drive, Dropbox, ou qualquer nuvem. Nunca apenas localmente!

**P: O backup inclui senhas?**
R: NÃO. Por segurança, senhas não são exportadas.

**P: Posso restaurar em outro servidor?**
R: SIM, desde que o schema do banco seja compatível.

**P: E se o restore der erro?**
R: Dados originais são preservados se houver erro (transação atômica).

---

## 📞 **Suporte**

Em caso de problemas com backup/restore, contate o desenvolvedor com:
- Horário do erro
- Mensagem de erro específica
- Tamanho do arquivo de backup (se aplicável)

---

**Versão do Documento:** 1.0  
**Última Atualização:** 2025-12-26  
**Sistema:** Agendador Andreia
