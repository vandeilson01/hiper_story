import crypto from 'node:crypto'
import { readSecure, setSession } from '../_secureStore.js'
const hash = value => crypto.scryptSync(value, process.env.DATA_ENCRYPTION_KEY || 'local-salt', 32).toString('hex')
export default function handler(req,res){ if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'}); const {email,password}=req.body||{}; const user=readSecure('users',[]).find(x=>x.email===String(email||'').toLowerCase()); if(!user||user.passwordHash!==hash(password||''))return res.status(401).json({error:'E-mail ou senha inválidos.'}); setSession(res,user.email); return res.json({authenticated:true,email:user.email,name:user.name}) }
