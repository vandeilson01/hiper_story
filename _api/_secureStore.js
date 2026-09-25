import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const configuredRoot = process.env.SECURE_DATA_DIR || path.join(process.cwd(), 'data')
const roots = process.env.VERCEL ? ['/tmp/hiper-data', configuredRoot] : [configuredRoot]
const key = crypto.createHash('sha256').update(process.env.DATA_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET || 'change-this-in-production').digest()
const fileFor = (root,name) => path.join(root, `${name}.enc.json`)

export function readSecure(name, fallback = []) {
  for (const root of roots) {
    try {
      const raw = JSON.parse(fs.readFileSync(fileFor(root,name), 'utf8'))
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(raw.iv, 'base64'))
      decipher.setAuthTag(Buffer.from(raw.tag, 'base64'))
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(raw.data, 'base64')), decipher.final()]).toString('utf8'))
    } catch {}
  }
  return fallback
}

export function writeSecure(name, value) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()])
  const payload = JSON.stringify({ version: 1, algorithm: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') })
  let lastError
  for (const root of roots) {
    try { fs.mkdirSync(root, { recursive: true }); fs.writeFileSync(fileFor(root,name), payload); return true } catch (error) { lastError=error }
  }
  console.error('[secure-store] unable to persist data', name, lastError?.message)
  return false
}

export function cookie(req, name) { return Object.fromEntries(String(req.headers.cookie || '').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2))[name] }
export function signSession(email) { const payload = Buffer.from(JSON.stringify({ email, exp: Date.now()+1000*60*60*8 })).toString('base64url'); return `${payload}.${crypto.createHmac('sha256', key).update(payload).digest('hex')}` }
export function validSession(token) { try { const [p,s] = String(token || '').split('.'); const expected=crypto.createHmac('sha256',key).update(p).digest('hex'); if(!p||!s||s.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected))) return null; const data=JSON.parse(Buffer.from(p,'base64url').toString()); return data.exp>Date.now()?data:null } catch { return null } }
export function setSession(res,email) { res.setHeader('Set-Cookie', `hiper_session=${encodeURIComponent(signSession(email))}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=28800`) }
