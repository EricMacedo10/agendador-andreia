/**
 * Formata o número de telefone para o padrão WhatsApp (apenas números, com DDI)
 */
export function formatPhoneForWhatsApp(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    
    // Se não tiver DDI (55), adiciona
    if (cleaned.length <= 11 && !cleaned.startsWith("55")) {
        return `55${cleaned}`;
    }
    
    return cleaned;
}

/**
 * Gera o link wa.me com a mensagem pré-configurada
 */
export function generateWhatsAppLink(
    phone: string,
    clientName: string,
    serviceName: string,
    time: string
): string {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const message = `Olá ${clientName}, tudo bem? 👋, passando para lembrar do seu horário de amanhã às ${time}. 😘`;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
