export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  res.setHeader('Set-Cookie', 'hiper_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0')
  return res.status(200).json({ authenticated: false })
}
