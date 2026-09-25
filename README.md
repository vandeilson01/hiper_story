# Hiper Stok — loja completa de móveis

## Atualização implementada

- **278 páginas/produtos** importados do catálogo PDF, da página 3 à 280.
- **981 fotos** mantidas e agrupadas por página/produto em `public/catalog-pages/pagina_XXX/`.
- JSON do catálogo em `public/products.json` e `src/catalog.json`.
- Categorias revisadas por título, descrição e palavras-chave do PDF, evitando colocar camas/colchões em escritório.
- Cada item abre uma **página própria**, sem modal, com galeria de todas as fotos do produto, detalhes, SKU, categoria e favoritos.
- Rotas próprias: `/`, `/produto/pg-177`, `/conta`, `/admin`, `/sacola` e `/checkout`.
- Carousel principal com pessoas, ambientes, móveis e marca Hiper Stok.
- Rodapé com telefone, endereço e links sociais configuráveis.

## Conta do cliente

- Cadastro e login por e-mail e senha.
- Senha armazenada como hash `scrypt`.
- Dados de usuários gravados em JSON criptografado com AES-256-GCM (`data/users.enc.json`).
- Sessão em cookie HttpOnly assinado.
- Login Google OAuth disponível em `/api/auth/google/start` quando as variáveis do Google estiverem configuradas.

Variáveis Google:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PUBLIC_APP_URL=https://seu-dominio.com
```

## Administração

- `/admin` é uma página própria, não modal.
- Painel com resumo, catálogo completo, pedidos, Mercado Pago e redes sociais.
- Configurações gravadas em JSON criptografado (`data/settings.enc.json`).
- Links de Instagram, Facebook, TikTok e WhatsApp editáveis pelo admin.
- Credenciais do Mercado Pago podem ser cadastradas no painel e são gravadas no mesmo cofre criptografado; o navegador nunca recebe o Access Token.

Variáveis mínimas:

```env
ADMIN_EMAIL=admin@hiperstok.com.br
ADMIN_PASSWORD=senha-forte
ADMIN_SESSION_SECRET=chave-longa-e-aleatoria
DATA_ENCRYPTION_KEY=chave-longa-e-aleatoria-diferente
```

## Mercado Pago

O checkout em `/checkout` calcula o frete e chama `POST /api/mercadopago/create-preference`. A API usa primeiro o token salvo criptografado pelo admin e, como fallback, `MERCADOPAGO_ACCESS_TOKEN`. O cliente é redirecionado para o `init_point` oficial do Mercado Pago.

Para ativar em produção, configure também:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
PUBLIC_APP_URL=https://seu-dominio.com
```

Cadastre o webhook do Mercado Pago em:

```text
https://seu-dominio.com/api/mercadopago/webhook
```

## Desenvolvimento

```bash
npm install
npm run dev
npm run build
```

> O armazenamento JSON criptografado funciona no desenvolvimento e em hospedagens com filesystem persistente. Em funções serverless sem disco persistente, troque a implementação de `api/_secureStore.js` por um banco/volume persistente antes do uso comercial.

## Deploy na Vercel Hobby

O projeto foi consolidado para usar **uma única Serverless Function** em `api/index.js`, evitando o limite de 12 funções do plano Hobby. Os handlers internos ficam em `_api/` e são roteados por `vercel.json`.

Na Vercel, cadastre as variáveis em **Settings → Environment Variables**:

```env
ADMIN_EMAIL=admin@hiperstok.com.br
ADMIN_PASSWORD=defina-uma-senha-forte
ADMIN_SESSION_SECRET=gere-uma-chave-longa
DATA_ENCRYPTION_KEY=gere-outra-chave-longa-diferente
PUBLIC_APP_URL=https://seu-projeto.vercel.app
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Depois faça um novo deploy. O diretório `api/` contém somente `index.js`, portanto o deploy não ultrapassa o limite de funções do plano Hobby.
