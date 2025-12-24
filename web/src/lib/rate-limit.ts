import { LRUCache } from 'lru-cache';

type Options = {
    key: string;
    limit: number;
    window: number; // milliseconds
};

// Cache com TTL de 1 hora, máximo 500 entradas
const cache = new LRUCache<string, number[]>({
    max: 500,
    ttl: 3600000 // 1 hora
});

/**
 * Rate limiting usando LRU Cache (em memória)
 * 
 * @param options - Configuração do rate limit
 * @param options.key - Chave única para identificar o recurso (ex: "user-123", "ip-192.168.1.1")
 * @param options.limit - Número máximo de requisições permitidas
 * @param options.window - Janela de tempo em milissegundos
 * 
 * @returns { success: boolean } - true se permitido, false se exceder o limite
 * 
 * @example
 * ```typescript
 * const limiter = await rateLimit({
 *     key: `notif-send-${userId}`,
 *     limit: 5,
 *     window: 60000 // 5 req/min
 * });
 * 
 * if (!limiter.success) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export async function rateLimit(options: Options): Promise<{ success: boolean }> {
    const { key, limit, window } = options;

    const now = Date.now();
    const timestamps = cache.get(key) || [];

    // Filtrar apenas timestamps dentro da janela temporal
    const validTimestamps = timestamps.filter(t => now - t < window);

    // Se exceder o limite, negar
    if (validTimestamps.length >= limit) {
        return { success: false };
    }

    // Adicionar novo timestamp e atualizar cache
    validTimestamps.push(now);
    cache.set(key, validTimestamps);

    return { success: true };
}

/**
 * Rate limit baseado em IP
 * Útil para endpoints públicos
 */
export async function rateLimitByIP(
    request: Request,
    limit: number,
    window: number
): Promise<{ success: boolean }> {
    // Tentar obter IP real (Vercel fornece headers específicos)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';

    return rateLimit({
        key: `ip-${ip}`,
        limit,
        window
    });
}
