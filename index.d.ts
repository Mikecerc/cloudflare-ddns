export interface Arguements {
    domain: string;
    dnsRecord: string;
    email: string;
    authKey: string;
    updateInterval: number;
}
export interface DNSRecord {
    id: string;
    zoneId: string;
    zoneName: string;
    name: string;
    type: string;
    content: string;
    proxiable: boolean;
    proxied: boolean;
    ttl: number;
    locked: boolean;
    meta: Record<string, unknown>;
    createdOn: string;
    modifiedOn: string;
}