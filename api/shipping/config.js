import { readSecure } from '../_secureStore.js'
export default function handler(req,res){const s=readSecure('settings',{});return res.json({enabled:s.shippingEnabled!==false,originCep:s.shippingOriginCep||'01000-000',basePrice:Number(s.shippingBasePrice||19.9),perItem:Number(s.shippingPerItem||7.5),extraRegion:Number(s.shippingExtraRegion||25)})}
