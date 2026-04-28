@echo off
set DATABASE_URL=postgresql://postgres.uzksaoaxgxrbzdcadanq:IsaManu%%4014@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true^&connection_limit=1
cd web
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" update-eric-password.ts
