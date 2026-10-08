// Build the real Vercel functions and import their emitted ESM with native Node.
const assert = require('node:assert/strict');
const {mkdtemp, mkdir, writeFile, readFile, copyFile, symlink, rm} = require('node:fs/promises');
const {join, dirname} = require('node:path');
const {tmpdir} = require('node:os');
const {spawnSync} = require('node:child_process');
const {pipeline} = require('node:stream/promises');
const {createWriteStream} = require('node:fs');
const {build} = require('@vercel/node');
const {FileFsRef} = require('@vercel/build-utils');

(async () => {
  const root = join(__dirname, '..');
  const staging = {};
  if (process.argv.includes('--staging-caption')) {
    for (const path of ['.env.staging.local', '.env.staging-users.local']) {
      for (const line of (await readFile(join(root, path), 'utf8')).split('\n')) {
        const index = line.indexOf('=');
        if (index < 0 || line.trim().startsWith('#')) continue;
        staging[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
      }
    }
    assert.equal(new URL(staging.SUPABASE_URL).hostname, 'zacrrtilppvekiyoybzn.supabase.co');
    // Pass only the configuration needed for this explicit staging integration run.
    for (const key of Object.keys(staging)) {
      if (!['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY', 'AI_DAILY_LIMIT',
        'VITE_SUPABASE_ANON_KEY', 'STAGING_ADMIN_EMAIL', 'STAGING_ADMIN_PASSWORD'].includes(key)) delete staging[key];
    }
  }
  const scratch = await mkdtemp(join(tmpdir(), 'uzzina-serverless-'));
  try {
    const sources = ['api/ai.ts', 'api/dash-auth.ts', 'api/dash-data.ts',
      'api/dash-action.ts', 'app/lib/ai-contract.ts', 'server/dash-session.ts', 'types/database.ts'];
    const files = {};
    for (const path of sources) {
      const target = join(scratch, path);
      await mkdir(dirname(target), {recursive: true});
      await copyFile(join(root, path), target);
      files[path] = new FileFsRef({fsPath: target});
    }
    await writeFile(join(scratch, 'package.json'), JSON.stringify({type: 'module'}));
    await copyFile(join(root, 'tsconfig.json'), join(scratch, 'tsconfig.json'));
    await symlink(join(root, 'node_modules'), join(scratch, 'node_modules'));
    for (const path of ['package.json', 'tsconfig.json']) {
      files[path] = new FileFsRef({fsPath: join(scratch, path)});
    }
    for (const entrypoint of sources.filter(path => path.startsWith('api/'))) {
      const result = await build({files, entrypoint, workPath: scratch,
        config: {projectSettings: {installCommand: ''}},
        meta: {isDev: false, skipDownload: true}, considerBuildCommand: true});
      const output = join(scratch, 'output', entrypoint.replace('.ts', ''));
      for (const [path, file] of Object.entries(result.output.files)) {
        // Installed packages are shared; all application code comes from the builder output.
        if (path === 'node_modules' || path.startsWith('node_modules/')) continue;
        const target = join(output, path);
        await mkdir(dirname(target), {recursive: true});
        await pipeline(file.toStream(), createWriteStream(target));
      }
      await symlink(join(root, 'node_modules'), join(output, 'node_modules'));
      const probe = `
        import assert from 'node:assert/strict';
        import {pathToFileURL} from 'node:url';
        const {default: handler} = await import(pathToFileURL(process.argv[1]).href);
        const originalFetch = globalThis.fetch;
        globalThis.fetch = () => {throw new Error('Unexpected external request');};
        const request = async (method, expected) => {
          const response = {headers: {}, setHeader(key, value) {this.headers[key] = value; return this;},
            status(code) {this.code = code; return this;}, json(body) {this.body = body; return this;}};
          await handler({method, headers: {}, query: {}, body: {}}, response);
          assert.equal(response.code, expected);
          assert.equal(typeof response.body.error, 'string');
          if (expected === 405) assert.ok(response.headers.Allow);
        };
        await request('OPTIONS', 405);
        ${entrypoint === 'api/ai.ts' ? "await request('POST', 401);" : ''}
        ${entrypoint === 'api/ai.ts' && staging.SUPABASE_URL ? `
          globalThis.fetch = originalFetch;
          const {createClient} = await import('@supabase/supabase-js');
          const client = createClient(process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY,
            {auth: {persistSession: false, autoRefreshToken: false}});
          const {data, error} = await client.auth.signInWithPassword({email: process.env.STAGING_ADMIN_EMAIL,
            password: process.env.STAGING_ADMIN_PASSWORD});
          assert.equal(error, null, 'Staging Auth failed');
          assert.ok(data.session);
          const response = {setHeader() {return this;}, status(code) {this.code = code; return this;},
            json(body) {this.body = body; return this;}};
          await handler({method: 'POST', headers: {authorization: 'Bearer ' + data.session.access_token},
            body: {intent: 'ai-caption', category: 'post', title: 'Teste técnico de legenda',
              description: 'Escreva uma legenda fictícia de duas palavras: Teste concluído.',
              partner_context: 'Marca fictícia de teste.'}}, response);
          assert.equal(response.code, 200, JSON.stringify(response.body));
          assert.equal(response.body.intent, 'ai-caption');
          assert.ok(response.body.output.caption.trim());
          await client.auth.signOut();
          console.log('PASS packaged AI handler: real staging Auth, persistent quota and OpenAI caption');
        ` : ''}
      `;
      const run = spawnSync(process.execPath, ['--input-type=module', '-e', probe, join(output, result.output.handler)],
        {encoding: 'utf8', timeout: 60000, env: {PATH: process.env.PATH, NODE_ENV: 'production', ...staging}});
      assert.equal(run.status, 0, `${entrypoint}: ${run.stderr || run.stdout}`);
      console.log(`PASS ${entrypoint}: Vercel build, native Node import and unauthenticated method guard`);
      if (run.stdout) process.stdout.write(run.stdout);
    }
  } finally {
    await rm(scratch, {recursive: true, force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
