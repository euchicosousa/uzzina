// Actual app and Supabase SDK; HTTP controlled. No production access.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
 try {
  const base=process.env.PORTAL_TEST_URL || 'http://127.0.0.1:5176';
  const width=Number(process.env.OPERATIONS_TEST_WIDTH || 1440);
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<768,isMobile:width<768,timezoneId:'America/Fortaleza'});
  page.setDefaultTimeout(10000);
  const activate=locator=>width<768?locator.tap():locator.click();
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGEERROR',e.message);});
  const userId='11111111-1111-4111-8111-111111111111';
  const user={id:userId,aud:'authenticated',role:'authenticated',email:'test@example.com',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
  const person={id:userId,user_id:userId,name:'Administrador teste',surname:'Teste',short:'Teste',initials:'AT',admin:true,visible:true,areas:[],image:null,email:user.email,preferences:null};
  const partners=[
   {id:'p-active',slug:'active',title:'Parceiro ativo',short:'Ativo',archived:false,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
   {id:'p-hidden',slug:'hidden',title:'Parceiro oculto',short:'Oculto',archived:true,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
  ];
  const actions=partners.map((p,i)=>({id:`action-${i}`,title:i?'AÇÃO OCULTA':'AÇÃO ATIVA',partners:[p.slug],responsibles:[userId],sprints:[],date:'2026-01-01T12:00:00Z',phase:'do',category:'post',priority:'medium',color:'#123456',description:'<p>INSUMO ORIGINAL — manter</p>',content_description:'<p>CONTEÚDO ORIGINAL</p>',strategies:[],content_files:[],work_files:[],instagram_caption:'LEGENDA ORIGINAL — manter',archived:false,created_at:'2026-01-01',updated_at:'2026-01-01'}));
  const queries=[];let searchMode='success';let releaseSearch;let searchGate=null;let notificationMode='empty';
  const writes=[];const gate=null;const fail=false;
  person.preferences={theme:'light',themeColorIndex:0,futureKey:'keep'};
  await page.route('**/*',async route=>{
   const req=route.request();const url=new URL(req.url());
   if(url.origin===base)return route.continue();
   if(url.pathname==='/rest/v1/rpc/update_my_preferences'||(url.pathname==='/rest/v1/people'&&req.method()==='PATCH')){
    const body=req.postDataJSON();const patch=body.p_patch||body.preferences;writes.push(patch);
    const waiting=gate;if(waiting)await waiting;
    if(fail)return route.fulfill({status:503,json:{message:'Controlled failure'}});
    Object.assign(person.preferences,patch);
    return route.fulfill({json:person.preferences});
   }
   if(url.pathname==='/auth/v1/user')return route.fulfill({json:user});
   if(url.pathname==='/rest/v1/rpc/get_app_bootstrap')return route.fulfill({json:{person,partners}});
   if(url.pathname==='/rest/v1/rpc/get_home_actions') {return route.fulfill({json:actions});}
   if(url.pathname==='/rest/v1/partners'){
    const filtered=url.searchParams.get('archived')==='eq.false'?partners.filter(p=>!p.archived):partners;
    return route.fulfill({json:filtered});
   }
   if(url.pathname==='/rest/v1/notifications')return route.fulfill({json:notificationMode==='empty'?[]:[{id:'notification-test',created_at:'invalid-date',author_name:'Pessoa teste',action_title:'Ação mencionada',comment_excerpt:'Comentário teste',read_at:null}]});
   if(url.pathname==='/rest/v1/people'){
    queries.push(url.searchParams.toString());
    return route.fulfill({json:url.searchParams.get('visible')==='eq.true'?[person]:[person,{...person,id:'archived-person',user_id:'archived-user',name:'Pessoa arquivada',surname:'Teste',visible:false}]});
   }
   if(url.pathname==='/rest/v1/actions'&&url.searchParams.has('ilike'))throw new Error('Unexpected ilike key');
   if(url.pathname==='/rest/v1/actions'&&url.searchParams.has('title')) {
    const q=url.searchParams.get('title');queries.push(q);
    assert.equal(url.searchParams.get('partners'),'ov.{active}');
    const waiting=searchGate;if(q.includes('antigo')&&waiting)await waiting;
    if(searchMode==='error')return route.fulfill({status:503,json:{message:'Controlled search failure'}});
    const title=q.includes('antigo')?'antigo resultado':'novo resultado';
    return route.fulfill({json:searchMode==='empty'?[]:[{...actions[0],title,partners:['unknown','active']},{...actions[0],id:'orphan',title:'novo órfão',partners:['zzunknown']}]});
   }
   if(url.pathname==='/rest/v1/actions') {
    if(req.method()==='PATCH') {
      const patch=req.postDataJSON(); const expected=url.searchParams.get('updated_at');
      writes.push({patch,expected});
      assert.equal(expected,`eq.${actions[0].updated_at}`);
      Object.assign(actions[0],patch,{updated_at:`2026-10-06T23:00:${String(writes.length).padStart(2,'0')}.000Z`});
      return route.fulfill({json:actions[0]});
    }
    return route.fulfill({json:actions});
   }
   if(url.pathname==='/rest/v1/people')return route.fulfill({json:[person]});
   if(url.pathname.startsWith('/rest/v1/'))return route.fulfill({json:[]});
   return route.abort();
  });
  await page.goto(`${base}/login`);
  const payload=Buffer.from(JSON.stringify({sub:userId,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated',role:'authenticated'})).toString('base64url');
  const token=`${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${payload}.test-signature`;
  await page.evaluate(async token=>{
   const {createSupabaseBrowserClient}=await import('/app/lib/supabase.client.ts');
   const {error}=await createSupabaseBrowserClient().auth.setSession({access_token:token,refresh_token:'controlled-test-refresh'});
   if(error)throw error;
  },token);
  await page.goto(`${base}/app`);
  await page.getByRole('heading',{name:'Atrasadas',exact:true}).waitFor();
  await page.getByText('AÇÃO ATIVA',{exact:true}).first().waitFor({timeout:7000}).catch(async error=>{console.error((await page.locator('body').innerText()).slice(0,1800));throw error;});

  const reveal=page.getByRole('button',{name:'Revelar barra de navegação'});
  if(await reveal.isVisible())await activate(reveal);
  const searchTrigger=page.locator('button:has(svg.lucide-search)').last();
  await searchTrigger.focus();await page.keyboard.press('Enter');
  const searchDialog=page.getByRole('dialog');
  await page.getByPlaceholder('Faça sua busca...').waitFor();
  for(let i=0;i<12;i++) {
   await page.keyboard.press('Tab');
   assert.equal(await searchDialog.evaluate(el=>el.contains(document.activeElement)),true,'Search dialog must retain keyboard focus');
  }
  await page.keyboard.press('Escape');
  await searchDialog.waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.activeElement?.querySelector('svg.lucide-search'));
  await page.keyboard.press('Meta+k');
  const input=page.getByPlaceholder('Faça sua busca...');await input.waitFor();
  searchMode='error';await input.fill('falha');
  await page.getByRole('alert').filter({hasText:'Não foi possível buscar ações. Tente novamente.'}).waitFor();
  searchMode='success';searchGate=new Promise(resolve=>{releaseSearch=resolve;});await input.fill('antigo');
  while(!queries.some(q=>q.includes('antigo')))await new Promise(resolve=>setTimeout(resolve,20));
  await input.fill('novo');await page.getByText('novo resultado',{exact:true}).waitFor();
  searchGate=null;releaseSearch();await page.waitForTimeout(100);
  assert.equal(await page.getByText('antigo resultado',{exact:true}).count(),0);
  await page.getByText('novo órfão',{exact:true}).waitFor();
  assert.equal(await page.getByRole('menuitem').filter({hasText:'novo resultado'}).locator('[data-slot=avatar-fallback]').innerText(),'AT');
  assert.equal(await page.getByRole('menuitem').filter({hasText:'novo órfão'}).locator('[data-slot=avatar-fallback]').innerText(),'ZZ');
  searchMode='empty';await input.fill('vazio');await page.getByText('Nenhum item foi encontrado.',{exact:true}).waitFor();
  await page.keyboard.press('Escape');
  if(await input.isVisible())await page.keyboard.press('Escape');
  await input.waitFor({state:'hidden'});
  await activate(page.getByRole('button',{name:'Notificações',exact:true}));
  await page.getByText('Nenhuma notificação nova.',{exact:true}).waitFor();
  const popover=page.locator('[data-slot=popover-content]');
  const box=await popover.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,'Notification popover must fit viewport');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Notificações');
  notificationMode='invalid';await page.reload();
  await activate(page.getByRole('button',{name:/^Notificações/}));
  await page.getByText('Ação mencionada',{exact:true}).waitFor();assert.equal(await page.getByText('Invalid Date',{exact:false}).count(),0);
  await page.keyboard.press('Escape');
  const people=await page.evaluate(async()=>{const {fetchPeople,fetchAllPeople}=await import('/app/lib/supabase.queries.ts');return {active:await fetchPeople(),all:await fetchAllPeople()};});
  assert.equal(people.active.length,1);assert.equal(people.all.length,2);assert.ok(queries.some(q=>q.includes('visible=eq.true')));
  await page.goto(`${base}/app/admin/users`);
  await page.getByRole('heading',{name:'Usuários Arquivados',exact:true}).waitFor();await page.locator('a[href="/app/admin/user/archived-user"]').waitFor();
  person.admin=false;await page.reload();await page.getByRole('heading',{name:'Acesso Restrito',exact:true}).waitFor();
  assert.equal(await page.getByText('Pessoa arquivada Teste',{exact:true}).count(),0);
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px actual search error/empty/success/stale result/partner fallback, notification empty/invalid date, people queries, admin list and UI guard. Controlled HTTP; not RLS.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
