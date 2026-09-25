import { cookie, validSession, readSecure, writeSecure } from '../_secureStore.js'
const ok=req=>{const s=validSession(cookie(req,'hiper_session'));return s&&s.email===process.env.ADMIN_EMAIL}
export default function handler(req,res){
  if(!ok(req))return res.status(401).json({error:'Não autenticado'})
  const key='catalog-overrides'; let data=readSecure(key,{products:[],categories:[],deleted:[],deletedCategories:[]})
  data.deleted=(data.deleted||[]).filter(Boolean); data.deletedCategories=(data.deletedCategories||[]).filter(Boolean)
  if(req.method==='GET')return res.json(data)
  if(req.method==='POST'){
    const body=req.body||{}
    if(body.type==='category'){
      const name=String(body.name||'').trim(),old=String(body.oldName||'').trim(); if(!name)return res.status(400).json({error:'Nome da categoria obrigatório'})
      if(old){data.categories=(data.categories||[]).map(x=>x===old?name:x);data.deletedCategories=data.deletedCategories.filter(x=>x!==old)}
      else{data.categories=[...new Set([...(data.categories||[]),name])];data.deletedCategories=data.deletedCategories.filter(x=>x!==name)}
      data.categories=[...new Set(data.categories)]
    }else{
      const raw=body.product||{},product={...raw,id:raw.id||`custom-${Date.now()}`,photos:Array.isArray(raw.photos)?raw.photos:[],image:raw.image||'/assets/hiper-stok-logo.png',updatedAt:new Date().toISOString()};data.deleted=data.deleted.filter(x=>x!==product.id);const i=data.products.findIndex(x=>x.id===product.id);i>=0?data.products.splice(i,1,product):data.products.push(product)
    }
    writeSecure(key,data);return res.json({saved:true,...data})
  }
  if(req.method==='DELETE'){
    const {type,id,name}=req.body||{}
    if(type==='category'&&name){data.categories=(data.categories||[]).filter(x=>x!==name);if(!data.deletedCategories.includes(name))data.deletedCategories.push(name)}
    else if(type==='product'&&id){data.products=data.products.filter(x=>x.id!==id);if(!data.deleted.includes(id))data.deleted.push(id)}
    writeSecure(key,data);return res.json({saved:true,...data})
  }
  return res.status(405).json({error:'Método não permitido'})
}
