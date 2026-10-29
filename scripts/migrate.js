import { getMigrations } from 'better-auth/db/migration';
import { getAuth,getPool } from '../server/auth.js';
if(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production'){console.log('Preview: no production database changes.');process.exit(0);}
const db=getPool();
try {
 const migration=await getMigrations(getAuth().options);await migration.runMigrations();
 await db.query(`CREATE TABLE IF NOT EXISTS portal_clients(id text PRIMARY KEY, name text NOT NULL, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
 CREATE TABLE IF NOT EXISTS portal_accounts(account_id text PRIMARY KEY, client_id text NOT NULL REFERENCES portal_clients(id), name text NOT NULL, currency text NOT NULL, token_ref text NOT NULL, active boolean NOT NULL DEFAULT true);
 CREATE TABLE IF NOT EXISTS portal_memberships(user_id text PRIMARY KEY REFERENCES "user"(id),client_id text NOT NULL REFERENCES portal_clients(id));
 CREATE TABLE IF NOT EXISTS portal_audit(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id text NOT NULL, action text NOT NULL, target text, created_at timestamptz NOT NULL DEFAULT now());
 CREATE TABLE IF NOT EXISTS portal_rate_limits(key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
 CREATE TABLE IF NOT EXISTS portal_campaign_jobs(id text PRIMARY KEY, actor_id text NOT NULL, account_id text NOT NULL, status text NOT NULL, ids jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
 CREATE TABLE IF NOT EXISTS portal_recovery(id text PRIMARY KEY, username text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), resolved boolean NOT NULL DEFAULT false);`);
 const existing=await db.query('SELECT id FROM "user" WHERE role=$1 LIMIT 1',['admin']);
 if(!existing.rowCount){
   if(!process.env.ADMIN_INITIAL_PASSWORD||!process.env.ADMIN_EMAIL)throw new Error('Initial administrator credentials required.');
   await getAuth().api.createUser({body:{email:process.env.ADMIN_EMAIL,name:'MDRS Administrator',password:process.env.ADMIN_INITIAL_PASSWORD,role:'admin',data:{username:'mdrs_admin',displayUsername:'mdrs_admin',mustChangePassword:true}}});
 }
 console.log('Database migration and administrator initialization complete.');
} catch { console.error('Database initialization failed. Inspect configuration and migration compatibility.');process.exitCode=1; }
finally {await db.end();}
