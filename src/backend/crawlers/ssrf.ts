import { URL } from 'url';

/**
 * Validates URLs against SSRF attacks:
 * 1. Checks protocol (only http and https allowed)
 * 2. Blocks loopback (127.0.0.1, localhost)
 * 3. Blocks private RFC1918 IPv4 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
 * 4. Blocks AWS/GCP metadata service IPs: 169.254.169.254, 169.254.0.0/16
 * 5. Blocks IPv6 loopback (::1) and private addresses
 */
export function validateSafeUrl(targetUrl: string): { valid: boolean; error?: string; normalizedUrl?: string } {
  try {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      // If user typed 'example.com', prepend https://
      parsed = new URL(`https://${targetUrl}`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: `Invalid protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check loopback names
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { valid: false, error: `Access to localhost and internal domain "${hostname}" is prohibited (SSRF prevention).` };
    }

    // IP address checks
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);

      // Loopback 127.0.0.0/8
      if (octet1 === 127) {
        return { valid: false, error: 'Access to loopback address (127.0.0.0/8) is prohibited.' };
      }
      // 0.0.0.0/8
      if (octet1 === 0) {
        return { valid: false, error: 'Access to broadcast/zero address is prohibited.' };
      }
      // Private Class A: 10.0.0.0/8
      if (octet1 === 10) {
        return { valid: false, error: 'Access to private network range 10.0.0.0/8 is prohibited.' };
      }
      // Private Class B: 172.16.0.0/12
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
        return { valid: false, error: 'Access to private network range 172.16.0.0/12 is prohibited.' };
      }
      // Private Class C: 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) {
        return { valid: false, error: 'Access to private network range 192.168.0.0/16 is prohibited.' };
      }
      // Link-Local / Cloud Metadata: 169.254.0.0/16
      if (octet1 === 169 && octet2 === 254) {
        return { valid: false, error: 'Access to link-local/cloud metadata service is prohibited.' };
      }
    }

    // IPv6 checks
    if (hostname.includes(':') || hostname.startsWith('[') || hostname === '::1') {
      return { valid: false, error: 'Direct IPv6 addresses are restricted for SSRF safety.' };
    }

    return { valid: true, normalizedUrl: parsed.toString() };
  } catch (err: any) {
    return { valid: false, error: `Invalid URL format: ${err.message}` };
  }
}
