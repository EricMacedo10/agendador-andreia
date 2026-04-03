# Sistema de Pacotes e Créditos (PACKAGE_SYSTEM.md)

Este guia explica como funciona o sistema de "créditos" do **Agendador Andreia**, permitindo que clientes comprem pacotes de sessões antecipadamente e os utilizem ao longo do tempo.

---

## 1. O que é um Pacote?

No sistema, um pacote é um "estoque" de sessões vinculado a um **serviço específico**. 
- Se a cliente compra um "Pacote de Sobrancelha com 3 sessões", o sistema registra 3 créditos associados ao serviço "Sobrancelha" na ficha dela.

---

## 2. Como Vender um Pacote

A venda de um pacote geralmente acontece durante a finalização de um atendimento:

1. No modal de agendamento, clique em **"Finalizar / Já Realizado"**.
2. No painel de checkout, procure a seção: **"➕ Vendeu um pacote hoje? Embutir créditos futuros"**.
3. Selecione o **Serviço** que compõe o pacote.
4. Digite a **Quantidade** de sessões vendidas.
5. Ao confirmar o pagamento, o sistema adicionará automaticamente esses créditos à carteira da cliente.

---

## 3. Como dar Baixa (Abater sessões)

Para que o sistema reconheça o crédito e permita a baixa automática (R$ 0,00), siga estes passos:

### Passo A: Seleção do Serviço
No agendamento, você **deve** selecionar o serviço exatamente igual ao que foi vendido no pacote. 
> [!IMPORTANT]
> Se o crédito for para "Pacote Sobrancelha" e você selecionar "Sobrancelha Simples", o sistema não oferecerá a opção de abatimento automático. Os nomes (IDs) precisam coincidir.

### Passo B: Ativar Checkout
Clique em **"Finalizar / Já Realizado"**.

### Passo C: Aplicar Crédito
Se a cliente tiver saldo, aparecerá um quadro azul: **"🎁 Cliente possui créditos!"**.
1. Marque a opção para "Usar 1 sessão".
2. O "Valor Cobrado" será ajustado para **0,00** (ou apenas o valor dos serviços extras).
3. A forma de pagamento mudará para **"Pacote Crédito"**.

### Passo D: Confirmar
Clique em **"Confirmar Pagamento Assinado"**. O saldo da cliente será reduzido em 1 unidade automaticamente.

---

## 🛠️ Detalhes Técnicos (Para Manutenção)

### Lógica de Banco de Dados (`Prisma`)
- Os créditos vivem na tabela `ClientCredit`, que possui um índice único combinando `clientId` e `serviceId`.
- Cada movimentação gera uma entrada na `CreditHistory` para auditoria.

### Casos de Erro Comuns
- **Tela Preta no Checkout**: Corrigido em 03/04/2026. Acontecia quando a API não trazia o objeto `service` dentro do crédito. Agora o `include: { service: true }` é obrigatório na rota `/api/clients`.
- **Crédito não aparece**: Verifique no menu "Serviços" se você não criou serviços duplicados com nomes parecidos. O crédito fica preso ao ID interno do serviço criado no momento da venda.

---

**Última atualização**: 2026-04-03  
**Status do Sistema**: Estável (v2.0)
