import { cookie, validSession } from '../_secureStore.js'
export default function handler(req,res){const s=validSession(cookie(req,'hiper_session'));if(!s)return res.status(401).json({authenticated:false});if(s.email!==process.env.ADMIN_EMAIL)return res.status(403).json({authenticated:false});return res.json({authenticated:true,email:s.email})}
