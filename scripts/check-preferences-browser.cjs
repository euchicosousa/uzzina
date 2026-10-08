// Actual app and Supabase SDK; HTTP controlled. No production access.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
 try {
  const base=process.env.PORTAL_TEST_URL || 'http://127.0.0.1:5176';
  const width=Number(process.env.PREFERENCES_TEST_WIDTH || 1440);
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
  const writes=[];let release;let gate=new Promise(resolve=>{release=resolve;});let fail=false;
  person.preferences={theme:'light',themeColorIndex:0,futureKey:'keep'};
  await page.route('**/*',async route=>{
   const req=route.request();const url=new URL(req.url());
   if(url.origin===base)return route.continue();
   if(url.pathname==='/rest/v1/rpc/update_my_preferences'||(url.pathname==='/rest/v1/people'&&req.method()==='PATCH')){
    const body=req.postDataJSON();const patch=body.p_patch||body.preferences;
    if(!patch){const waiting=gate;if(waiting)await waiting;Object.assign(person,body);return route.fulfill({json:person});}
    writes.push(patch);
    const waiting=gate;if(waiting)await waiting;
    if(fail)return route.fulfill({status:503,json:{message:'Controlled failure'}});
    Object.assign(person.preferences,patch);
    return route.fulfill({json:person.preferences});
   }
   if(url.pathname==='/auth/v1/logout')return route.fulfill({json:{}});
   if(url.pathname==='/auth/v1/user')return route.fulfill({json:user});
   if(url.pathname==='/rest/v1/rpc/get_app_bootstrap')return route.fulfill({json:{person,partners}});
   if(url.pathname==='/rest/v1/rpc/get_home_actions') {return route.fulfill({json:actions});}
   if(url.pathname==='/rest/v1/partners'){
    const filtered=url.searchParams.get('archived')==='eq.false'?partners.filter(p=>!p.archived):partners;
    return route.fulfill({json:filtered});
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

  const choose=async name=>{
    await activate(page.getByRole('button',{name:'Menu do perfil do usuário'}));
    await activate(page.getByRole('menuitem',{name,exact:true}));
  };
  await choose('Tema escuro');
  await page.waitForFunction(()=>document.documentElement.classList.contains('dark'));
  while(writes.length===0)await new Promise(resolve=>setTimeout(resolve,20));
  const palette=await page.evaluate(async()=>{const {PALLETE}=await import('/app/lib/palettes.ts');return PALLETE[1].label;});
  await choose(palette);
  await page.waitForTimeout(400);
  assert.equal(writes.length,1,'Only one preference write may be in flight');
  gate=null;release();
  await page.waitForFunction(()=>localStorage.getItem('uzzina-accent-color-index')==='1');
  while(writes.length<2)await new Promise(resolve=>setTimeout(resolve,20));
  await page.waitForTimeout(100);
  assert.equal(person.preferences.theme,'dark');assert.equal(person.preferences.themeColorIndex,1);
  assert.equal(person.preferences.futureKey,'keep');
  await page.reload();
  await page.getByRole('button',{name:'Menu do perfil do usuário'}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('uzzina-accent-color-index')),'1');
  fail=true;await choose('Cores do parceiro');
  await page.getByText('Não foi possível salvar suas preferências. Tente novamente.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('uzzina-follow-partner-color')),'true');
  fail=false;
  await activate(page.getByRole('button',{name:'Menu do perfil do usuário'}));
  await activate(page.getByRole('menuitem',{name:'Tentar salvar preferências',exact:true}));
  await page.waitForTimeout(350);assert.equal(person.preferences.followPartnerColor,true);
  await page.goto(`${base}/app/profile`);
  await activate(page.getByRole('button',{name:'Salvar Alterações',exact:true}));
  await page.getByText('Perfil e preferências salvos com sucesso!',{exact:true}).waitFor();
  assert.equal(person.preferences.futureKey,'keep');
  const beforeLogout=writes.length;
  gate=new Promise(resolve=>{release=resolve;});
  const profileRequest=page.waitForRequest(req=>new URL(req.url()).pathname==='/rest/v1/people'&&req.method()==='PATCH');
  await activate(page.getByRole('button',{name:'Salvar Alterações',exact:true}));await profileRequest;
  await page.evaluate(async()=>{const {createSupabaseBrowserClient}=await import('/app/lib/supabase.client.ts');await createSupabaseBrowserClient().auth.signOut({scope:'local'});});
  await page.waitForURL('**/login');gate=null;release();await page.waitForTimeout(300);
  assert.equal(writes.length,beforeLogout,'Old profile save must not send preferences after logout');
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px preferences: immediate preview; serialized writes; theme+palette merge; reload; failure preserves choice; explicit retry. Controlled HTTP, not PostgreSQL.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
