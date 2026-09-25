import { readSecure } from '../_secureStore.js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const { destinationCep, items = [] } = req.body || {}
  const cep = String(destinationCep || '').replace(/\D/g, '')
  if (cep.length !== 8) return res.status(400).json({ error: 'Informe um CEP válido.' })

  const config = readSecure('settings', {})
  if (config.shippingEnabled === false) return res.status(403).json({ error: 'O cálculo de frete está temporariamente desativado.' })
  const origin = Number(String(config.shippingOriginCep || '01000').replace(/\D/g, '').slice(0, 5)) || 1000
  const destinationPrefix = Number(cep.slice(0, 5))
  const distanceIndex = Math.abs(destinationPrefix - origin)
  const weight = Math.max(1, items.reduce((sum, item) => sum + Number(item.quantity || 1), 0))
  const region = destinationPrefix < 20000 ? 'Sudeste' : destinationPrefix < 70000 ? 'Centro-Oeste/Sul' : 'Norte/Nordeste'
  const base = Number(config.shippingBasePrice || 19.9) + (region === 'Norte/Nordeste' ? Number(config.shippingExtraRegion || 25) : region === 'Centro-Oeste/Sul' ? Number(config.shippingExtraRegion || 25) * .4 : 0)
  const distanceFactor = Math.min(42, Math.round(distanceIndex / 900))
  const price = Number((base + distanceFactor + (weight - 1) * Number(config.shippingPerItem || 7.5)).toFixed(2))
  const days = region === 'Sudeste' ? '3 a 6 dias úteis' : region === 'Centro-Oeste/Sul' ? '5 a 9 dias úteis' : '8 a 14 dias úteis'
  return res.status(200).json({ origin: 'São Paulo — Centro', destinationCep: cep, region, price, deliveryEstimate: days, method: 'Entrega padrão' })
}
