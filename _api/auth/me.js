import { cookie, validSession, readSecure } from '../_secureStore.js'
export default function handler(req,res){const s=validSession(cookie(req,'hiper_session'));if(!s)return res.status(401).json({authenticated:false});const u=readSecure('users',[]).find(x=>x.email===s.email);return res.json({authenticated:true,email:s.email,name:u?.name||''})}
