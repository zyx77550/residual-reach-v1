import { promises as dns } from 'dns'
import * as net from 'net'

export type EmailValidationResult = {
  email:  string
  valid:  boolean
  method: string
  score:  number
}

const EMAIL_PATTERNS = [
  (f: string, l: string) => `${f}.${l}`,
  (f: string, l: string) => `${f[0]}.${l}`,
  (f: string, l: string) => `${f}`,
  (f: string, l: string) => `${l}`,
  (f: string, l: string) => `${f}${l}`,
  (f: string, l: string) => `${f}_${l}`,
]

export function generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
  const f = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const l = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return EMAIL_PATTERNS.map(fn => `${fn(f, l)}@${domain}`)
}

export async function validateDomain(domain: string): Promise<boolean> {
  try {
    const mx = await dns.resolveMx(domain)
    return mx.length > 0
  } catch {
    return false
  }
}

export async function validateEmailSmtp(email: string, domain: string): Promise<boolean> {
  try {
    const mxRecords = await dns.resolveMx(domain)
    if (!mxRecords.length) return false

    mxRecords.sort((a, b) => a.priority - b.priority)
    const mx = mxRecords[0].exchange

    return new Promise((resolve) => {
      const socket = net.createConnection(25, mx)
      let step = 0
      const timeout = setTimeout(() => { socket.destroy(); resolve(false) }, 5000)

      socket.on('data', (data) => {
        const msg = data.toString()
        if (step === 0 && msg.startsWith('220')) {
          socket.write(`EHLO verify.residualreach.io\r\n`)
          step = 1
        } else if (step === 1 && (msg.includes('250') || msg.includes('220'))) {
          socket.write(`MAIL FROM:<verify@residualreach.io>\r\n`)
          step = 2
        } else if (step === 2 && msg.startsWith('250')) {
          socket.write(`RCPT TO:<${email}>\r\n`)
          step = 3
        } else if (step === 3) {
          clearTimeout(timeout)
          socket.write('QUIT\r\n')
          socket.destroy()
          resolve(msg.startsWith('250') || msg.startsWith('251'))
        }
      })

      socket.on('error', () => { clearTimeout(timeout); resolve(false) })
    })
  } catch {
    return false
  }
}

export async function checkBlacklist(domain: string): Promise<boolean> {
  // Vérification Spamhaus DNS
  const lookupDomain = `${domain}.dnsbl.spamhaus.org`
  try {
    await dns.resolve4(lookupDomain)
    return true // Listed = blacklisted
  } catch {
    return false // Not listed = clean
  }
}
