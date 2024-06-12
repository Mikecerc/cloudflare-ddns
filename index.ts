import type { Arguements, DNSRecord } from './index.d';
import fetch, { Response } from 'node-fetch';
import { CronJob } from 'cron';
//config the environment variables
try {
    const arguements: Arguements = {
        domain: process.env.DOMAIN || '',
        dnsRecord: process.env.DNS_RECORD || '',
        email: process.env.EMAIL || '',
        authKey: process.env.AUTH_KEY || '',
        updateInterval: parseInt(process.env.UPDATE_INTERVAL || '1')
    };
    console.log('Running the job')
    const job = new CronJob(`*/${arguements.updateInterval} * * * *`, () => {
        updateRecord(arguements.domain, arguements.dnsRecord, arguements.email, arguements.authKey);
    }, null, true, 'America/New_York');
} catch (error) {
    console.error('Error: ', error);
}

async function updateRecord(domain: string, dnsRecordName: string, email: string, token: string) {
    let zoneId, recordInfo: DNSRecord;

    const headers = {
        'X-Auth-Email': email,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }

    let response: Response;
    try {
        response = await fetch(`https://api.cloudflare.com/client/v4/user/tokens/verify`, { headers: headers });

        if (response.status !== 200) {
            console.error('Error: Invalid credentials');
            return Promise.reject(response);
        }
        //get the zone id
        response = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
            headers
        });
        let res: any = await response.json();
        zoneId = res.result[0].id;

        //get the record 
        response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${dnsRecordName}`, {
            headers
        });
        res = await response.json();
        recordInfo = res.result[0];

        //get public IP 
        response = await fetch('https://api.ipify.org');
        const pubIP = await response.text();

        //update the record
        if (pubIP !== recordInfo.content) {
            console.log(`Updating ${dnsRecordName} to ${pubIP}`);
            response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordInfo.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    type: recordInfo.type,
                    name: recordInfo.name,
                    content: pubIP,
                    ttl: recordInfo.ttl,
                    proxied: recordInfo.proxied
                })
            });
        } else {
            console.log('No change in IP');
        }
    } catch (error) {
        console.error('General error');
        return Promise.reject(error)
    }
}
