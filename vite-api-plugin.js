import fs from 'node:fs'
import path from 'node:path'

export function apiPlugin() {
  return {
    name: 'hiper-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        try {
          const parsed = new URL(req.url, 'http://localhost')
          const file = path.join(process.cwd(), parsed.pathname.replace(/^\//, '') + '.js')
          if (!fs.existsSync(file)) return next()
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
            const chunks=[]
            for await (const chunk of req) chunks.push(chunk)
            const raw=Buffer.concat(chunks).toString('utf8')
            try { req.body=raw?JSON.parse(raw):{} } catch { req.body={} }
          }
          req.query=Object.fromEntries(parsed.searchParams.entries())
          res.status = code => { res.statusCode=code; return res }
          res.json = value => { if (!res.headersSent) res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(value)) }
          res.redirect = url => { res.statusCode=302; res.setHeader('Location',url); res.end() }
          const mod=await server.ssrLoadModule('/'+path.relative(process.cwd(),file).replaceAll('\\','/'))
          await mod.default(req,res)
        } catch (error) {
          console.error('[api]', req.url, error)
          if (!res.headersSent) { res.statusCode=500; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({error:'Erro interno da API local.'})) }
        }
      })
    }
  }
}
