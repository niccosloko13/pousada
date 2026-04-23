type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(data ? { data } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export function logSecurityEvent(event: string, data?: Record<string, unknown>) {
  emit("warn", event, data);
}

export function logPaymentEvent(event: string, data?: Record<string, unknown>) {
  emit("info", event, data);
}

export function logAppError(event: string, error: unknown, data?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : "unknown_error";
  emit("error", event, { ...data, message });
}

export function logDebug(event: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  emit("info", event, data);
}
