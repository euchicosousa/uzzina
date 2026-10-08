// Actual app and Supabase SDK; HTTP controlled. No production access.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
 try {
  const base=process.env.PORTAL_TEST_URL || 'http://127.0.0.1:5176';
  const width=Number(process.env.ACTION_CONTROLS_TEST_WIDTH || 1440);
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<768,isMobile:width<768,timezoneId:'America/Fortaleza'});
  page.setDefaultTimeout(10000);
  const activate=locator=>width<768?locator.tap():locator.click();
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGEERROR',e.message);});
  const userId='11111111-1111-4111-8111-111111111111';
  const user={id:userId,aud:'authenticated',role:'authenticated',email:'test@example.com',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
  const person={id:userId,user_id:userId,name:'Administrador teste',surname:'Teste',short:'Teste',initials:'AT',admin:true,visible:true,areas:[],image:null,email:user.email,preferences:null};
  const partners=[
   {id:'p-active',slug:'active',title:'Parceiro ativo',short:'Ativo',archived:false,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
   {id:'p-second',slug:'second',title:'Parceiro segundo',short:'Segundo',archived:false,users_ids:['22222222-2222-4222-8222-222222222222'],image:null,colors:['#ff0055','#ffffff'],sow:'social'},
   {id:'p-hidden',slug:'hidden',title:'Parceiro oculto',short:'Oculto',archived:true,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
  ];
  const actions=partners.map((p,i)=>({id:`action-${i}`,title:i?'AÇÃO OCULTA':'AÇÃO ATIVA',partners:[p.slug],responsibles:[userId],sprints:[],date:'2026-01-01T12:00:00Z',phase:'do',category:'post',priority:'medium',color:'#123456',description:'<p>INSUMO ORIGINAL — manter</p>',content_description:'<p>CONTEÚDO ORIGINAL</p>',strategies:[],content_files:[],work_files:[],instagram_caption:'LEGENDA ORIGINAL — manter',archived:false,created_at:'2026-01-01',updated_at:'2026-01-01'}));
  let createdDraft=null;
  const writes=[];const aiRequests=[];const aiMode='success';let aiGate=null;let releaseAI;
  const strategies=Array.from({length:5},(_,i)=>({headline:`Estratégia teste ${i+1}`,angulo:`${i+1}. Ângulo teste`,racional:'Racional de teste',direcionamento:'Direção de teste'}));
  await page.route('**/*',async route=>{
   const req=route.request();const url=new URL(req.url());
   if(url.origin===base&&url.pathname==='/api/ai') {
    const payload=req.postDataJSON();aiRequests.push(payload);
    const gate=aiGate;
    if(gate)await gate;
    if(aiMode==='abort')return route.abort('internetdisconnected');
    if(typeof aiMode==='number')return route.fulfill({status:aiMode,json:{error:'Controlled failure'},headers:{'Retry-After':'60'}});
    const output=payload.intent==='ai-strategy'?{strategies}:payload.intent==='ai-content'?{content:'<p>CONTEÚDO GERADO DE TESTE</p>'}:{caption:'LEGENDA GERADA DE TESTE'};
    return route.fulfill({json:{intent:payload.intent,output:aiMode==='invalid'?{caption:42}:output}});
   }
   if(url.origin===base)return route.continue();
   if(url.pathname==='/auth/v1/user')return route.fulfill({json:user});
   if(url.pathname==='/rest/v1/rpc/get_app_bootstrap')return route.fulfill({json:{person,partners}});
   if(url.pathname==='/rest/v1/rpc/get_home_actions') {return route.fulfill({json:actions});}
   if(url.pathname==='/rest/v1/partners'){
    const filtered=url.searchParams.get('archived')==='eq.false'?partners.filter(p=>!p.archived):partners;
    return route.fulfill({json:filtered});
   }
   if(url.pathname==='/rest/v1/actions') {
    if(req.method()==='POST'){const patch=req.postDataJSON();createdDraft={...patch,id:'created-draft',updated_at:'2026-10-07T12:00:00Z'};return route.fulfill({json:createdDraft});}
    if(req.method()==='PATCH') {
      const patch=req.postDataJSON(); const expected=url.searchParams.get('updated_at');
      writes.push({patch,expected});
      assert.equal(expected,`eq.${actions[0].updated_at}`);
      Object.assign(actions[0],patch,{updated_at:`2026-10-06T23:00:${String(writes.length).padStart(2,'0')}.000Z`});
      return route.fulfill({json:actions[0]});
    }
    return route.fulfill({json:actions});
   }
   if(url.pathname==='/rest/v1/people')return route.fulfill({json:[person,{...person,id:'second-person',user_id:'22222222-2222-4222-8222-222222222222',name:'Outra pessoa',short:'Outra'}]});
   if(url.pathname.startsWith('/rest/v1/'))return route.fulfill({json:[]});
   return route.abort();
  });
  assert.equal((await page.request.get(`${base}/api/ai`)).status(),405);
  assert.equal((await page.request.post(`${base}/api/ai`,{data:{intent:'ai-caption',category:'post'}})).status(),401);
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

  const drawer=page.locator('div.fixed.top-16.right-0');
  const card=()=>page.locator('[data-action-id="action-0"]').first();
  const openDrawer=async()=>{
    if(width<768){const bounds=await card().boundingBox();assert.ok(bounds);await card().tap({position:{x:bounds.width-12,y:bounds.height-12}});}else await card().press('Enter');
    await page.getByRole('button',{name:'Fechar',exact:true}).waitFor();
  };
  const closeDrawer=async()=>{
   await activate(page.getByRole('button',{name:'Fechar',exact:true}));
   await page.getByRole('button',{name:'Fechar',exact:true}).waitFor({state:'hidden'});
  };
  if(width>=768){
    await page.mouse.move(1,1);await card().focus();
    const savedPhase=page.waitForResponse(response=>new URL(response.url()).pathname==='/rest/v1/actions'&&response.request().method()==='PATCH');
    await page.keyboard.press('t');await savedPhase;
    assert.equal(actions[0].phase,'done','Keyboard focus without hover must select the real card');
    await openDrawer();
    const before=writes.length;
    await page.getByRole('textbox',{name:'Título da ação'}).focus();await page.keyboard.press('c');
    await page.waitForTimeout(150);assert.equal(writes.length,before,'Title input must not invoke card shortcut');
    await page.getByRole('textbox',{name:'Título da ação'}).fill('AÇÃO ATIVA');
    const editor=drawer.locator('.tiptap[contenteditable=true]').first();await editor.focus();await page.keyboard.press('z');
    await page.waitForTimeout(150);assert.ok(writes.slice(before).every(w=>!('phase'in w.patch)),'Rich editor must not invoke card shortcut');
    await closeDrawer();
  }
  const categories=[['stories','Stories'],['post','Post Estático'],['reels','Reels'],['carousel','Carrossel']];
  for(const [slug,title] of categories){
    actions[0].category=slug;actions[0].strategies=[];await page.reload();await openDrawer();
    await drawer.getByRole('button',{name:`Categoria: ${title}`,exact:true}).waitFor();
    await drawer.getByRole('button',{name:`Fase: ${actions[0].phase==='done'?'Feito':'Fazer'}`,exact:true}).waitFor();
    await drawer.getByRole('button',{name:'Parceiro ativo',exact:true}).waitFor();
    await drawer.getByRole('button',{name:'CRIAR ESTRATÉGIA',exact:true}).waitFor();
    if(slug==='stories'){
     aiGate=new Promise(resolve=>{releaseAI=resolve;});
     await activate(drawer.getByRole('button',{name:'CRIAR ESTRATÉGIA',exact:true}));
     await drawer.getByRole('button',{name:'CRIANDO ESTRATÉGIA...',exact:true}).waitFor();
     aiGate=null;releaseAI();await page.getByRole('heading',{name:'5 Estratégias Sugeridas'}).waitFor();
     await page.keyboard.press('Escape');
     await drawer.getByRole('button',{name:'RECRIAR ESTRATÉGIAS',exact:true}).waitFor();
    }
    await activate(drawer.getByRole('tab',{name:'INSTAGRAM',exact:true}));
    await drawer.getByRole('tab',{name:'Conteúdo',exact:true}).waitFor();
    await drawer.getByRole('tab',{name:'Legenda',exact:true}).waitFor();
    await closeDrawer();
  }
  actions[0].strategies=strategies.map(s=>({...s,selected:false}));await page.reload();await openDrawer();
  await drawer.getByRole('button',{name:'RECRIAR ESTRATÉGIAS',exact:true}).waitFor();
  await activate(drawer.getByRole('tab',{name:'INSTAGRAM',exact:true}));
  await drawer.getByRole('button',{name:'Selecione a estratégia',exact:true}).waitFor();
  await activate(drawer.getByRole('button',{name:'Ver estratégias',exact:true}));
  await activate(page.getByRole('checkbox',{name:'Selecionar estratégia'}).nth(1).locator('xpath=ancestor::label').locator('[data-slot=checkbox-box]'));
  await page.keyboard.press('Escape');
  await drawer.getByRole('button',{name:'Estratégia teste 2',exact:true}).waitFor();
  await activate(drawer.getByRole('tab',{name:'ESSENCIAL',exact:true}));
  aiGate=new Promise(resolve=>{releaseAI=resolve;});
  await activate(drawer.getByRole('button',{name:'RECRIAR ESTRATÉGIAS',exact:true}));
  await drawer.getByRole('button',{name:'RECRIANDO ESTRATÉGIAS...',exact:true}).waitFor();
  aiGate=null;releaseAI();await page.getByRole('heading',{name:'5 Estratégias Sugeridas'}).waitFor();
  await page.keyboard.press('Escape');await drawer.getByRole('button',{name:'RECRIAR ESTRATÉGIAS',exact:true}).waitFor();
  const initialResponsibles=[...actions[0].responsibles];
  await activate(drawer.getByRole('button',{name:'Parceiro ativo',exact:true}));
  await activate(page.getByRole('menuitem',{name:'Parceiro segundo',exact:false}));
  await page.waitForTimeout(150);
  if(await page.getByPlaceholder('Procurar parceiro...').isVisible())await page.keyboard.press('Escape');
  if(await page.getByRole('button',{name:'Fechar',exact:true}).isVisible())await closeDrawer();
  assert.deepEqual(actions[0].responsibles,initialResponsibles,'Changing partner must preserve chosen responsibles');
  assert.ok(actions[0].partners.includes('second'));
  await activate(page.getByRole('button',{name:width<768?'Ação':'Nova Ação',exact:true}));
  await drawer.getByRole('button',{name:'Parceiros',exact:true}).waitFor();
  await activate(drawer.getByRole('button',{name:'Parceiros',exact:true}));
  const selectPartner=async name=>{
   if(!await page.getByPlaceholder('Procurar parceiro...').isVisible())await activate(drawer.getByRole('button',{name:/^(Parceiros|Parceiro ativo|Parceiro segundo)/}).last());
   await activate(page.getByRole('menuitem',{name,exact:false}));await page.waitForTimeout(150);
  };
  await selectPartner('Parceiro ativo');await selectPartner('Parceiro segundo');await selectPartner('Parceiro ativo');
  await page.waitForTimeout(150);
  if(await page.getByPlaceholder('Procurar parceiro...').isVisible())await page.keyboard.press('Escape');
  await page.getByRole('textbox',{name:'Título da ação'}).fill('Nova ação de teste');
  await activate(drawer.getByRole('button',{name:'Criar',exact:true}));
  for(let i=0;i<100&&!createdDraft;i++)await page.waitForTimeout(20);
  assert.ok(createdDraft);assert.deepEqual(createdDraft.partners,['second']);
  assert.deepEqual(createdDraft.responsibles,[userId],'New draft must keep chosen responsible instead of adopting second partner team');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),"Page must not overflow horizontally");
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px real compact combobox labels, stories/post/reels/carousel tabs, strategy selected/fallback/recreate label, partner change preserves responsibles; desktop keyboard focus/input/editor. Controlled HTTP; no real writes.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
