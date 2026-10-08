// Actual app and Supabase SDK; HTTP controlled. No production access.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
 try {
  const base=process.env.PORTAL_TEST_URL || 'http://127.0.0.1:5176';
  const touch=process.env.TOUCH_TEST==='1';
 const page=await browser.newPage({hasTouch:touch,isMobile:touch,viewport:{width:Number(process.env.DRAWER_TEST_WIDTH || 1440),height:900},timezoneId:'America/Fortaleza'});
  await page.clock.setFixedTime(new Date('2026-10-07T15:00:00Z'));
  page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const userId='11111111-1111-4111-8111-111111111111';
  const user={id:userId,aud:'authenticated',role:'authenticated',email:'test@example.com',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
  const person={id:userId,user_id:userId,name:'Administrador teste',surname:'Teste',short:'Teste',initials:'AT',admin:true,visible:true,areas:[],image:null,email:user.email,preferences:null};
  const partners=[
   {id:'p-active',slug:'active',title:'Parceiro ativo',short:'Ativo',archived:false,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
   {id:'p-hidden',slug:'hidden',title:'Parceiro oculto',short:'Oculto',archived:true,users_ids:[userId],image:null,colors:['#123456','#ffffff'],sow:'social'},
  ];
  const actions=Array.from({length:2},(_,i)=>{const p=partners[0];return ({id:`${i+1}1111111-1111-4111-8111-111111111111`,title:`AÇÃO ATIVA ${i+1}`,partners:[p.slug],responsibles:[userId],sprints:[],date:'2026-10-07 10:00:00',phase:'do',category:'design',priority:'medium',color:'#123456',description:null,content_files:[],work_files:[],instagram_caption:'',archived:false,created_at:'2026-01-01',updated_at:'2026-01-01T00:00:00.000000Z'});});
  const gates=[];
  const patches=[];const partnerRequests=[];const scopes=[];
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
    if(req.method()==='PATCH') {
      const id=url.searchParams.get('id')?.slice(3);
      const row=actions.find(a=>a.id===id);
      const patch=req.postDataJSON();patches.push({id,patch,version:url.searchParams.get('updated_at')});
      const outcome=await new Promise(resolve=>gates.push(resolve));
      if(outcome==='fail')return route.fulfill({status:500,json:{message:'Falha de rede controlada'}});
      const expected=url.searchParams.get('updated_at')?.slice(3);
      if(expected!==row.updated_at)return route.fulfill({status:406,json:{code:'PGRST116',message:'Version conflict'}});
      Object.assign(row,patch,{updated_at:`2026-10-07T15:00:00.${String(patches.length).padStart(6,'0')}Z`});
      return route.fulfill({json:row});
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
  console.log('Opening local app');
  await page.goto(`${base}/login`);
  const payload=Buffer.from(JSON.stringify({sub:userId,exp:2208988800,aud:'authenticated',role:'authenticated'})).toString('base64url');
  const token=`${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${payload}.test-signature`;
  await page.evaluate(async token=>{
   const {createSupabaseBrowserClient}=await import('/app/lib/supabase.client.ts');
   const {error}=await createSupabaseBrowserClient().auth.setSession({access_token:token,refresh_token:'controlled-test-refresh'});
   if(error)throw error;
  },token);
  console.log('Opening partner view');
  await page.goto(`${base}/app/partner/active`);
  const viewToggle=page.getByRole('button',{name:'Alternar Visão Feed'});
  await viewToggle.waitFor();
  if(await viewToggle.getAttribute('aria-pressed')==='true')await viewToggle.click();
  await page.getByText('AÇÃO ATIVA 1',{exact:true}).first().waitFor({timeout:7000}).catch(async error=>{console.error((await page.locator('body').innerText()).slice(0,1800));throw error;});



  const idA=actions[0].id,idB=actions[1].id;
  const waitCount=async count=>{await page.waitForFunction(()=>true);for(let i=0;i<100&&patches.length<count;i++)await new Promise(resolve=>setTimeout(resolve,25));assert.equal(patches.length,count);};
  const release=async(index,outcome)=>{assert.equal(typeof gates[index],'function');const response=page.waitForResponse(r=>r.request().method()==='PATCH'&&new URL(r.url()).pathname==='/rest/v1/actions');gates[index](outcome);await response;};
  const cdp=touch?await page.context().newCDPSession(page):null;
  let finger={x:0,y:0};
  const endGesture=async()=>{if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();};
  const card=(id,day)=>page.locator(`#day_2026-10-${day} [data-action-id="${id}"]`).first();
  const startDrag=async(source)=>{
    await source.scrollIntoViewIfNeeded();const box=await source.boundingBox();assert.ok(box);
    finger={x:box.x+6,y:box.y+6};
    if(cdp){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});
      finger={x:box.x+20,y:box.y+10};
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[finger]});
    }else{await page.mouse.move(finger.x,finger.y);await page.mouse.down();await page.mouse.move(box.x+20,box.y+10,{steps:4});}
  }
  const moveTo=async(target)=>{
    await target.scrollIntoViewIfNeeded();const box=await target.boundingBox();assert.ok(box);
    const targetPoint={x:box.x+box.width/2,y:box.y+50};
    if(cdp){
      const from=finger;
      for(let step=1;step<=10;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(targetPoint.x-from.x)*step/10,y:from.y+(targetPoint.y-from.y)*step/10}]});
      finger=targetPoint;
    }else await page.mouse.move(targetPoint.x,targetPoint.y,{steps:10});
  }
  const moveCard=async(id,from,to)=>{await startDrag(card(id,from));await moveTo(page.locator(`#day_2026-10-${to}`));await endGesture();}
  console.log('Calendar: older failure while another drag is active');
  await moveCard(idA,'07','08');await waitCount(1);
  await startDrag(card(idB,'07'));await moveTo(page.locator('#day_2026-10-09'));
  assert.equal(await page.locator(`[data-action-id="${idB}"]`).count(),2);
  await release(0,'fail');
  await page.waitForFunction(id=>document.querySelectorAll(`[data-action-id="${id}"]`).length===2,idB);
  await endGesture();await waitCount(2);await release(1,'ok');
  await card(idA,'07').waitFor();await card(idB,'09').waitFor();
  assert.equal(patches[1].patch.date,'2026-10-09 10:00:00');
  console.log('Calendar: two pending moves of the same action');
  await moveCard(idA,'07','08');await waitCount(3);
  await moveCard(idA,'08','09');assert.equal(patches.length,3);
  await release(2,'ok');await waitCount(4);
  assert.equal(patches[3].version,`eq.${actions[0].updated_at}`);
  await card(idA,'09').waitFor();await release(3,'ok');
  await page.waitForFunction(id=>document.querySelectorAll(`[data-action-id="${id}"]`).length===1,idA);
  await card(idA,'09').waitFor();
  await startDrag(card(idB,'09'));
  if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  else{await page.keyboard.press('Escape');await endGesture();}
  assert.equal(patches.length,4);

  if(touch){assert.deepEqual(errors,[]);console.log('PASS browser-emulated touch: calendar concurrent drags, queued versions, rollback and cancel. Physical device not tested.');return;}
  for(const action of actions)action.date='2026-10-07 10:00:00';
  await page.goto(`${base}/app/today`);
  await page.getByLabel('Visão por Kanban',{exact:true}).click().catch(async error=>{console.error((await page.locator('body').innerText()).slice(-1800));throw error;});
  const column=title=>page.getByRole('heading',{name:title,exact:true}).locator('..').locator('..').locator('..');
  const kanbanCard=id=>column('Fazer').locator(`[data-action-id="${id}"]`).first();
  console.log('Kanban: older success while another drag is active');
  await startDrag(kanbanCard(idA));await moveTo(column('Feito'));await endGesture();await waitCount(5);
  await startDrag(kanbanCard(idB));await moveTo(column('Concluído'));
  assert.equal(await page.locator(`[data-action-id="${idB}"]`).count(),2);
  await release(4,'ok');
  await page.waitForFunction(id=>document.querySelectorAll(`[data-action-id="${id}"]`).length===2,idB);
  await endGesture();await waitCount(6);await release(5,'fail');
  await column('Feito').locator(`[data-action-id="${idA}"]`).waitFor();
  await column('Fazer').locator(`[data-action-id="${idB}"]`).waitFor();
  assert.ok(patches.every(p=>p.version&&Object.keys(p.patch).every(key=>['date','phase','sprints'].includes(key))));
  assert.deepEqual(errors,[]);
  console.log('PASS real pointer gestures: calendar failure rollback preserves new drag; queued same-action moves use confirmed microsecond version; Escape sends no write; Kanban older success preserves new drag and newer failure rolls back only itself. Controlled HTTP, no production writes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
