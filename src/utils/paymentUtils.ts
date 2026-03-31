export function generatePaymentReference(prefix: 'ord' | 'bok', entityId: string): string {
  const compactEntityId = entityId.replace(/[^a-zA-Z0-9]/g, '').slice(-4);
  const timestamp = Date.now().toString(36).slice(-5);
  const random = Math.random().toString(36).slice(2, 5);

  return `${prefix}${compactEntityId}${timestamp}${random}`.slice(0, 15);
}
