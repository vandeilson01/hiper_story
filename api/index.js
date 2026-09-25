import adminCatalog from '../_api/admin/catalog.js'
import adminLogin from '../_api/admin/login.js'
import adminLogout from '../_api/admin/logout.js'
import adminMe from '../_api/admin/me.js'
import adminOrders from '../_api/admin/orders.js'
import adminProfile from '../_api/admin/profile.js'
import adminSettingsGet from '../_api/admin/settings-get.js'
import adminSettings from '../_api/admin/settings.js'
import googleCallback from '../_api/auth/google/callback.js'
import googleStart from '../_api/auth/google/start.js'
import authLogin from '../_api/auth/login.js'
import authLogout from '../_api/auth/logout.js'
import authMe from '../_api/auth/me.js'
import authProfile from '../_api/auth/profile.js'
import authRegister from '../_api/auth/register.js'
import createPreference from '../_api/mercadopago/create-preference.js'
import mercadopagoWebhook from '../_api/mercadopago/webhook.js'
import publicSettings from '../_api/settings/public.js'
import shippingConfig from '../_api/shipping/config.js'
import shippingQuote from '../_api/shipping/quote.js'
import publicCatalog from '../_api/catalog/public.js'

const routes = {
  '/api/catalog/public': publicCatalog,
  '/api/admin/catalog': adminCatalog,
  '/api/admin/login': adminLogin,
  '/api/admin/logout': adminLogout,
  '/api/admin/me': adminMe,
  '/api/admin/orders': adminOrders,
  '/api/admin/profile': adminProfile,
  '/api/admin/settings-get': adminSettingsGet,
  '/api/admin/settings': adminSettings,
  '/api/auth/google/callback': googleCallback,
  '/api/auth/google/start': googleStart,
  '/api/auth/login': authLogin,
  '/api/auth/logout': authLogout,
  '/api/auth/me': authMe,
  '/api/auth/profile': authProfile,
  '/api/auth/register': authRegister,
  '/api/mercadopago/create-preference': createPreference,
  '/api/mercadopago/webhook': mercadopagoWebhook,
  '/api/settings/public': publicSettings,
  '/api/shipping/config': shippingConfig,
  '/api/shipping/quote': shippingQuote,
}

export default async function handler(req, res) {
  const forwarded = req.query?.path || req.query?.route
  const raw = String(forwarded || req.url || '').split('?')[0]
  const pathname = raw.startsWith('/api/') ? raw : `/api/${raw.replace(/^\/+/, '')}`
  const route = routes[pathname]
  if (!route) return res.status(404).json({ error: 'Rota API não encontrada.', path: pathname })
  return route(req, res)
}
