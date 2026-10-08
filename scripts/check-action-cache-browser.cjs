// Actual app and Supabase SDK; HTTP controlled. No production access.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
 try {
  const base=process.env.PORTAL_TEST_URL || 'http://127.0.0.1:5176';
  const page=await browser.newPage({viewport:{width:Number(process.env.DRAWER_TEST_WIDTH || 1440),height:900},timezoneId:'America/Fortaleza'});
  await page.clock.setFixedTime(new Date('2026-10-07T15:00:00Z'));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const userId='11111111-1111-4111-8111-111111111111';
  const user={id:userId,aud:'authenticated',role:'authenticated',email:'test@example.com',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
  const person={id:userId,user_id:userId,name:'Administrador teste',surname:'Teste',short:'Teste',initials:'AT',admin:true,visible:true,areas:[],image:null,email:user.email,preferences:null};
  const partners=[
   {id:'p-active',slug:'active',title:'Parceiro ativo',short:'Ativo',archived:false,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
   {id:'p-hidden',slug:'hidden',title:'Parceiro oculto',short:'Oculto',archived:true,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
  ];
  const actions=partners.map((p,i)=>({id:`action-${i}`,title:i?'AÇÃO OCULTA':'AÇÃO ATIVA',partners:[p.slug],responsibles:[userId],sprints:[],date:'2026-10-07 10:00:00',phase:'do',category:'design',priority:'medium',color:'#123456',description:null,content_files:[],work_files:[],instagram_caption:'',archived:false,created_at:'2026-01-01',updated_at:'2026-01-01'}));
  const partnerRequests=[];const scopes=[]; let releaseInsert=null; let insertArrived=()=>{}; const inserts=[];
  await page.route('**/*',async route=>{
   const req=route.request();const url=new URL(req.url());
   if(url.origin===base)return route.continue();
   if(url.pathname==='/auth/v1/user')return route.fulfill({json:user});
   if(url.pathname==='/rest/v1/rpc/get_app_bootstrap')return route.fulfill({json:{person,partners}});
   if(url.pathname==='/rest/v1/rpc/get_home_actions') {const q=req.postDataJSON();scopes.push(q.p_partner_slugs);return route.fulfill({json:actions.filter(a=>!a.archived&&a.partners.some(p=>q.p_partner_slugs.includes(p)))});}
   if(url.pathname==='/rest/v1/partners'){
    partnerRequests.push(url.searchParams.get('archived'));
    const filtered=url.searchParams.get('archived')==='eq.false'?partners.filter(p=>!p.archived):partners;
    return route.fulfill({json:filtered});
   }
   if(url.pathname==='/rest/v1/actions') {
    if(req.method()==='POST') {
      const payload=req.postDataJSON();inserts.push(payload);
      await new Promise(resolve=>{releaseInsert=resolve;insertArrived();});
      const row={...payload,id:`22222222-2222-4222-8222-${String(inserts.length).padStart(12,'0')}`,updated_at:`2026-10-07T15:00:${String(inserts.length).padStart(2,'0')}.000Z`};
      actions.push(row);return route.fulfill({json:row});
    }
    const id=url.searchParams.get('id');
    if(id)return route.fulfill({json:actions.find(a=>id===`eq.${a.id}`)});
    const overlap=url.searchParams.get('partners');
    let rows=actions.filter(a=>!a.archived&&(!overlap||a.partners.some(p=>overlap.includes(p))));
    const before=url.searchParams.get('date');
    if(before?.startsWith('lt.'))rows=rows.filter(a=>a.date<before.slice(3)&&a.phase!=='finished');
    return route.fulfill({json:rows});
   }
   if(url.pathname==='/rest/v1/people')return route.fulfill({json:[person]});
   if(url.pathname.startsWith('/rest/v1/'))return route.fulfill({json:[]});
   return route.abort();
  });
  await page.goto(`${base}/login`);
  const payload=Buffer.from(JSON.stringify({sub:userId,exp:2208988800,aud:'authenticated',role:'authenticated'})).toString('base64url');
  const token=`${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${payload}.test-signature`;
  await page.evaluate(async token=>{
   const {createSupabaseBrowserClient}=await import('/app/lib/supabase.client.ts');
   const {error}=await createSupabaseBrowserClient().auth.setSession({access_token:token,refresh_token:'controlled-test-refresh'});
   if(error)throw error;
  },token);
  await page.goto(`${base}/app/partner/active`);
  const viewToggle=page.getByRole('button',{name:'Alternar Visão Feed'});
  await viewToggle.waitFor();
  if(await viewToggle.getAttribute('aria-pressed')==='true')await viewToggle.click();
  await page.getByText('AÇÃO ATIVA',{exact:true}).first().waitFor({timeout:7000}).catch(async error=>{console.error((await page.locator('body').innerText()).slice(0,1800));throw error;});

  await page.keyboard.press('Control+Alt+a');
  await page.getByRole('textbox',{name:'Título da ação'}).waitFor();
  await page.getByRole('textbox',{name:'Título da ação'}).fill('CACHE NOVA');
  const firstArrival=new Promise(resolve=>{insertArrived=resolve;});
  const firstRequest=page.waitForRequest(req=>req.method()==='POST'&&new URL(req.url()).pathname==='/rest/v1/actions');
  await page.getByRole('textbox',{name:'Título da ação'}).press('Tab');await firstRequest;await firstArrival;
  assert.equal(await page.locator('[data-action-id^="temp-"]').count(),0);
  assert.equal(await page.locator('[data-action-id="22222222-2222-4222-8222-000000000001"]').count(),0);
  const firstResponse=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/rest/v1/actions');
  assert.equal(typeof releaseInsert,'function');releaseInsert();await firstResponse;
  await page.getByRole('button',{name:'Fechar',exact:true}).click();
  await page.getByRole('button',{name:'Fechar',exact:true}).waitFor({state:'hidden'});
  const card=page.locator('[data-action-id="22222222-2222-4222-8222-000000000001"]');
  await card.waitFor();assert.equal(await card.count(),1);
  const secondArrival=new Promise(resolve=>{insertArrived=resolve;});
  const secondRequest=page.waitForRequest(req=>req.method()==='POST'&&new URL(req.url()).pathname==='/rest/v1/actions');
  await card.hover();await card.press('Shift+d');await secondRequest;await secondArrival;
  assert.equal(inserts[1].title,'CACHE NOVA (Cópia)');
  assert.equal(await page.locator('[data-action-id^="temp-"]').count(),0);
  const secondResponse=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/rest/v1/actions');
  releaseInsert();await secondResponse;
  const copy=page.locator('[data-action-id="22222222-2222-4222-8222-000000000002"]');
  await copy.waitFor();assert.equal(await copy.count(),1);assert.equal(await card.count(),1);
  assert.equal(await page.locator('[data-action-id="action-1"]').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS actual app browser: pending create has no provisional cards; confirmed create once; real duplicate once; hidden partner remains absent. Controlled external HTTP, no production writes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
