import { cookie, validSession, readSecure } from '../_secureStore.js'
export default function handler(req,res){const s=validSession(cookie(req,'hiper_session'));if(!s||s.email!==process.env.ADMIN_EMAIL)return res.status(401).json({error:'Não autenticado'});if(req.method!=='GET')return res.status(405).json({error:'Método não permitido'});return res.json({orders:readSecure('orders',[])})}
