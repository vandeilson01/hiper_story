import { readSecure, writeSecure } from '../_secureStore.js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const settings = readSecure('settings', {}); const accessToken = settings.mercadopagoToken || process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) return res.status(503).json({ error: 'Mercado Pago ainda não configurado. Entre no Admin > Mercado Pago e salve o Access Token.' })
  const { items = [], buyer = {}, shipping = 0, destinationCep = '' } = req.body || {}
  if (!items.length) return res.status(400).json({ error: 'O carrinho está vazio.' })
  if (items.some(item => !Number(item.price) || Number(item.price) <= 0)) return res.status(422).json({ error: 'Há produtos sem preço cadastrado. Cadastre os preços dos itens antes de iniciar o pagamento.' })
  const origin = settings.publicAppUrl || req.headers.origin || process.env.PUBLIC_APP_URL || 'http://localhost:5173'; const orderId=`HS-${Date.now()}`
  const preference={items:items.map(item=>({id:String(item.id),title:String(item.name||item.title).slice(0,120),quantity:Number(item.quantity||1),currency_id:'BRL',unit_price:Number(item.price||0)})),shipments:{cost:Number(shipping||0),mode:'not_specified'},payer:{name:buyer.name,email:buyer.email},back_urls:{success:`${origin}/?pagamento=sucesso`,failure:`${origin}/?pagamento=falhou`,pending:`${origin}/?pagamento=pendente`},auto_return:'approved',notification_url:`${origin}/api/mercadopago/webhook`,external_reference:orderId,statement_descriptor:'HIPER STOK'}
  const response=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify(preference)});const data=await response.json();if(!response.ok)return res.status(response.status).json({error:data.message||'Não foi possível criar o pagamento.',details:data})
  const orders=readSecure('orders',[]);orders.unshift({id:orderId,status:'pending',createdAt:new Date().toISOString(),buyer,items,shipping:Number(shipping||0),destinationCep,preferenceId:data.id,total:items.reduce((sum,x)=>sum+Number(x.price||0)*Number(x.quantity||1),0)+Number(shipping||0)});writeSecure('orders',orders)
  return res.status(200).json({id:data.id,orderId,initPoint:data.init_point,sandboxInitPoint:data.sandbox_init_point})
}
