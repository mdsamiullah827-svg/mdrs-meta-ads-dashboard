import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizeAccount,requireAdmin,metaQuery,cleanMeta,checkOrigin} from '../server/security.js';
test('client A cannot read client B even with a valid account identifier',()=>{
 const user={id:'client-a',role:'user'};
 assert.equal(authorizeAccount(user,{account_id:'act_1',active:true},true).account_id,'act_1');
 assert.throws(()=>authorizeAccount(user,{account_id:'act_2',active:true},false),e=>e.status===403);
 assert.throws(()=>authorizeAccount(user,{account_id:'act_1',active:false},true),e=>e.status===403);
 assert.throws(()=>authorizeAccount(user,null,false),e=>e.status===403);
});
test('client role cannot mutate and admin requires MFA',()=>{
 assert.throws(()=>requireAdmin({role:'user',twoFactorEnabled:true}),e=>e.status===403);
 assert.throws(()=>requireAdmin({role:'admin',twoFactorEnabled:false}),e=>e.status===403);
 assert.doesNotThrow(()=>requireAdmin({role:'admin',twoFactorEnabled:true}));
});
test('report query rejects token injection, graph traversal, fields expansion and unbounded limits',()=>{
 for(const query of [{access_token:'attacker'},{fields:'id,adaccounts{access_token}'},{limit:'999999'},{fields:'../me'},{time_range:'{}'},{after:'outside-cursor'}])assert.throws(()=>metaQuery(query));
 assert.equal(metaQuery({fields:'spend,reach',date_preset:'last_30d',limit:'50'}).get('fields'),'spend,reach');
});
test('Meta response strips token-bearing paging and nested credentials',()=>{
 const d=cleanMeta({data:[{name:'secret123',token:'secret123'}],paging:{next:'https://graph.facebook.com/?access_token=secret123'}},['secret123']);
 assert.equal(JSON.stringify(d).includes('secret123'),false);assert.equal(d.paging,undefined);
});
test('state-changing requests reject missing or hostile origins',()=>{
 process.env.BETTER_AUTH_URL='https://portal.example';
 for(const origin of [undefined,'https://attacker.example'])assert.throws(()=>checkOrigin({method:'POST',headers:{origin}}));
 assert.doesNotThrow(()=>checkOrigin({method:'POST',headers:{origin:'https://portal.example'}}));
});
