import { envConfig } from '@/configs/env';

interface VendusClientInput {
  name: string;
  fiscal_id?: string;
  address?: string;
  postalcode?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  external_reference?: string;
  send_email?: 'yes' | 'no';
}

interface VendusDocumentItemInput {
  reference: string;
  title: string;
  qty: number;
  gross_price: string;
}

interface VendusDocumentInput {
  type: string;
  client: {
    id: number;
  };
  items: VendusDocumentItemInput[];
  date: string;
  date_supply: string;
  notes?: string;
  external_reference: string;
  output: 'pdf_url';
  mode: 'normal' | 'tests';
  tx_id: string;
  errors_full: 'yes';
}

interface VendusClientResponse {
  id: number;
}

interface VendusDocumentResponse {
  id: number;
  number?: string;
  output?: string;
}

interface VendusErrorResponse {
  error?: string;
  errors?: unknown;
  message?: string;
}

function getBaseUrl(): string {
  return envConfig.VENDUS_BASE_URL.replace(/\/+$/, '');
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as VendusErrorResponse;
    return body.error || body.message || JSON.stringify(body.errors) || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

async function vendusRequest<TResponse>(
  path: string,
  init: RequestInit,
  responseType: 'json' | 'buffer' = 'json'
): Promise<TResponse> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${envConfig.VENDUS_API_KEY}`,
      ...(responseType === 'json' ? { Accept: 'application/json' } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Vendus request failed for ${path}: ${await parseError(response)}`);
  }

  if (responseType === 'buffer') {
    return Buffer.from(await response.arrayBuffer()) as unknown as TResponse;
  }

  return (await response.json()) as TResponse;
}

export async function createVendusClient(
  payload: VendusClientInput
): Promise<VendusClientResponse> {
  return vendusRequest<VendusClientResponse>('/clients/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createVendusDocument(
  payload: VendusDocumentInput
): Promise<VendusDocumentResponse> {
  return vendusRequest<VendusDocumentResponse>('/documents/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function finalizeVendusDocument(documentId: number): Promise<void> {
  await vendusRequest(`/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'F',
      mode: envConfig.VENDUS_MODE,
    }),
  });
}

export async function downloadVendusPdf(documentId: number, pdfUrl?: string): Promise<Buffer> {
  if (pdfUrl) {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download Vendus PDF from URL: HTTP ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  return vendusRequest<Buffer>(`/documents/${documentId}.pdf`, { method: 'GET' }, 'buffer');
}
