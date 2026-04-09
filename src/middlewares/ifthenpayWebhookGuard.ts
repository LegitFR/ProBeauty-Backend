import type { NextFunction, Request, Response } from 'express';

/**
 * Ifthenpay's known callback IP ranges.
 * Source: https://ifthenpay.com/docs — update if ifthenpay publishes new ranges.
 */
const IFTHENPAY_ALLOWED_IPS = ['194.210.115.0/24', '194.210.114.0/24'];

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, prefixLen] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(prefixLen, 10))) - 1) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
}

function isAllowedIp(ip: string): boolean {
  return IFTHENPAY_ALLOWED_IPS.some((cidr) => isIpInCidr(ip, cidr));
}

function resolveClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress;
}

export function ifthenpayWebhookGuard(req: Request, res: Response, next: NextFunction): void {
  const clientIp = resolveClientIp(req);

  if (!clientIp || !isAllowedIp(clientIp)) {
    console.warn(`[IfthenpayGuard] Rejected callback from IP: ${clientIp ?? 'unknown'}`);
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  next();
}
