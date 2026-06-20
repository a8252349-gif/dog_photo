type Entry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const globalStore = globalThis as typeof globalThis & {
  __petPhotoRateLimitStore?: Map<string, Entry>;
};

const store =
  globalStore.__petPhotoRateLimitStore ??
  (globalStore.__petPhotoRateLimitStore = new Map<string, Entry>());

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function generateRateLimitEnabled() {
  const configured = process.env.GENERATE_RATE_LIMIT_ENABLED?.trim().toLowerCase();

  if (configured === "false" || configured === "0" || configured === "off") {
    return false;
  }

  if (configured === "true" || configured === "1" || configured === "on") {
    return true;
  }

  // 로컬 개발에서는 반복 테스트를 막지 않고, 운영 환경에서만 기본 활성화합니다.
  return process.env.NODE_ENV === "production";
}

export function getGenerateRateLimitConfig() {
  return {
    limit: positiveInteger(process.env.GENERATE_RATE_LIMIT_MAX, 8),
    windowMs:
      positiveInteger(process.env.GENERATE_RATE_LIMIT_WINDOW_MINUTES, 30) *
      60 *
      1000,
  };
}

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();

  // 오래된 항목이 계속 쌓이지 않도록 가볍게 정리합니다.
  if (store.size > 1_000) {
    for (const [storedKey, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(storedKey);
      }
    }
  }

  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });

    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    ok: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function refundRateLimit(key: string) {
  const current = store.get(key);

  if (!current) {
    return;
  }

  if (current.count <= 1) {
    store.delete(key);
    return;
  }

  current.count -= 1;
  store.set(key, current);
}

export function requestIp(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const forwarded = request.headers.get("x-forwarded-for");
  const forwardedIp = forwarded?.split(",")[0]?.trim();
  if (forwardedIp) return forwardedIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return process.env.NODE_ENV === "development" ? "local-development" : "unknown";
}
