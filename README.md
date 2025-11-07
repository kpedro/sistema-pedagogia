# Sistema Pedagogia – MVP multi-escola

MVP funcional com Next.js (App Router), Prisma/SQLite, NextAuth (Credentials + 2FA TOTP), módulos pedagógicos essenciais e hooks para expansão futura.

## Checklist local

1. Instale dependências  
   ```bash
   npm install
   ```

2. Configure `.env` a partir de `.env.example` (NEXTAUTH_SECRET, SMTP, TZ, etc).

3. Gere Prisma + banco local  
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

4. Crie diretório de uploads  
   ```bash
   mkdir uploads backups
   ```

5. Inicie o servidor  
   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000/login`  
   - Admin seed: `admin@eeti.rbc.br / Admin@123`  
   - Configure o TOTP com o segredo impresso no seed.

7. Rodar cron local (backup/limpeza)  
   ```bash
   npm run cron:run
   ```

## Scripts úteis

- `npm run prisma:migrate` – novas migrações
- `npm run prisma:studio` – inspeção rápida
- `npm run seed` – reseed seguro
- `npm run build && npm run start` – modo produção local
- `npm run test` – placeholder (Vitest pronto para cobrir hooks/serviços)

## Deploy (Vercel + GitHub)

1. Suba o repositório para GitHub.
2. Conecte o projeto no Vercel (framework Next 14).
3. Configure variáveis de ambiente no Vercel (`NEXTAUTH_SECRET`, `DATABASE_URL` apontando para Turso/Neon quando migrar, SMTP, etc).
4. Configure `ENABLE_FILE_SYSTEM_API` (caso use uploads locais no ambiente preview – para produção, planeje R2/Wasabi).
5. Defina `NEXTAUTH_URL=https://seu-dominio.br`.
6. Rode `vercel deploy` (opcional) ou faça deploy automático por branch main.

### Banco remoto (Turso/libSQL)

- Instale o CLI `turso` e faça login (`turso auth signup/login`).
- Crie dois bancos (principal e shadow):  
  ```bash
  turso db create sistema-pedagogia-prod
  turso db create sistema-pedagogia-shadow
  ```
- Para cada banco, gere um token e copie a URL `libsql://...`:  
  ```bash
  turso db show <nome> --url
  turso db tokens create <nome>
  ```
- Configure as variáveis na Vercel (e use-as ao rodar migrações):  
  ```
  DATABASE_URL=libsql://sistema-pedagogia-prod.turso.io?authToken=seu-token
  SHADOW_DATABASE_URL=libsql://sistema-pedagogia-shadow.turso.io?authToken=seu-token-shadow
  ```
- Rode as migrações/seed apontando para o banco remoto:  
  ```bash
  DATABASE_URL="libsql://...prod...?authToken=..." \
  SHADOW_DATABASE_URL="libsql://...shadow...?authToken=..." \
  npx prisma migrate deploy

  DATABASE_URL="libsql://...prod...?authToken=..." \
  npm run seed
  ```
- Ajuste `NEXTAUTH_URL`/`APP_BASE_URL` para o domínio público antes do redeploy.

## DNS Registro.br → Vercel

1. No Registro.br, adicione registros CNAME conforme instruções do Vercel (`www` → `cname.vercel-dns.com`).
2. Se usar domínio raiz, alinhe A/ALIAS conforme docs do Vercel (apontar para `76.76.21.21`).
3. Valide HTTPS automático no Vercel.

## Observações

- TODO Fase2: workflow completo de templates customizados, automações de IA (curadoria segura), integrações externas e armazenamento S3/R2.
- Logs/Auditoria gravados no Prisma (tabela `AuditLog`).
- Hooks para RiskRules, importação CSV/Sheets, estúdio de conteúdo com processamento assíncrono, numeração documental com expiração de 7 dias.
- Rate limit padrão 100 req/5min, rotas críticas 30/5min (ajustável via `.env`).
- Mantido foco em free tiers e componentes substituíveis (SMTP, storage, banco remoto).
