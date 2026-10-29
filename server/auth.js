import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins/username';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { admin } from 'better-auth/plugins/admin';
import pg from 'pg';
let pool, auth;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('Database is not configured.');
  return pool ||= new pg.Pool({connectionString:process.env.DATABASE_URL, max:3, connectionTimeoutMillis:10000});
}
export function getAuth() {
  if (!process.env.BETTER_AUTH_SECRET) throw new Error('Authentication is not configured.');
  return auth ||= betterAuth(authOptions(getPool()));
}
export function authOptions(database) {
  return {
    appName:'MDRS Client Portal', baseURL:process.env.BETTER_AUTH_URL,
    secret:process.env.BETTER_AUTH_SECRET, database,
    trustedOrigins:[process.env.BETTER_AUTH_URL].filter(Boolean),
    emailAndPassword:{enabled:true,disableSignUp:true,minPasswordLength:12,maxPasswordLength:128,revokeSessionsOnPasswordReset:true},
    session:{expiresIn:60*60*24*7,updateAge:60*60*12,cookieCache:{enabled:false}},
    user:{additionalFields:{mustChangePassword:{type:'boolean',defaultValue:true,input:false}}},
    rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-in/*':{window:60,max:5},'/two-factor/*':{window:60,max:8}}},
    plugins:[username({minUsernameLength:3,maxUsernameLength:40,immutableUsername:true}),twoFactor({issuer:'MDRS Client Portal'}),admin()],
    advanced:{useSecureCookies:process.env.NODE_ENV==='production'},
    logger:{disabled:true}
  };
}
