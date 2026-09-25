import { setSession } from '../_secureStore.js'
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const { email, password } = req.body || {}
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) return res.status(503).json({ error: 'Configure ADMIN_EMAIL e ADMIN_PASSWORD na hospedagem antes de acessar o painel.' })
  if (email !== adminEmail || password !== adminPassword) return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
  setSession(res, email)
  return res.status(200).json({ authenticated: true, email })
}
