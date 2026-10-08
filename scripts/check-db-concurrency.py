"""Real two-connection quota/preferences checks; disposable local PostgreSQL only.
Usage: python3 scripts/check-db-concurrency.py /path/to/psql /private/socket uzzina_test_name
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import time

psql, socket, database = sys.argv[1:]
if not database.startswith('uzzina_test_') or not Path(socket).is_absolute():
    raise SystemExit('Private socket and disposable uzzina_test_ database required')
args = [psql, '-X', '-h', socket, '-p', '55432', '-U', 'postgres', '-d', database, '-v', 'ON_ERROR_STOP=1', '-At']
user_id = 'eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee'

def query(sql):
    return subprocess.check_output(args + ['-c', sql], text=True).strip()


def contention(first, second):
    env_a = dict(os.environ, PGAPPNAME='uzzina_test_writer_a')
    env_b = dict(os.environ, PGAPPNAME='uzzina_test_writer_b')
    a = subprocess.Popen(args + ['-c', first], env=env_a, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    b = None
    try:
        deadline = time.monotonic() + 8
        while query("SELECT count(*) FROM pg_stat_activity WHERE application_name='uzzina_test_writer_a' AND wait_event='PgSleep'") != '1':
            if a.poll() is not None or time.monotonic() > deadline:
                raise AssertionError('Writer A did not hold its transaction open')
            time.sleep(0.05)
        b = subprocess.Popen(args + ['-c', second], env=env_b, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        while query("SELECT count(*) FROM pg_stat_activity WHERE application_name='uzzina_test_writer_b' AND wait_event_type='Lock'") != '1':
            if b.poll() is not None or time.monotonic() > deadline:
                raise AssertionError('Writer B did not wait on the actual PostgreSQL lock')
            time.sleep(0.05)
        out_a, err_a = a.communicate(timeout=10)
        out_b, err_b = b.communicate(timeout=10)
        if a.returncode or b.returncode:
            raise AssertionError(err_a + err_b)
        return out_a, out_b
    finally:
        for process in (a, b):
            if process is not None and process.poll() is None:
                process.kill()
                process.communicate()


query(f"""INSERT INTO auth.users(id,email) VALUES('{user_id}','concurrency@test.invalid');
INSERT INTO public.people(user_id,name,surname,short,initials,areas,preferences)
VALUES('{user_id}','Concurrent','Test','Test','CT',ARRAY['design'],'{{"futureKey":"keep"}}');""")
try:
    first, second = contention(
        f"BEGIN; SET LOCAL ROLE service_role; SELECT public.consume_ai_usage('{user_id}',1); SELECT pg_sleep(3); COMMIT;",
        f"SET ROLE service_role; SELECT public.consume_ai_usage('{user_id}',1);"
    )
    assert 't' in first.splitlines() and 'f' in second.splitlines(), (first, second)
    assert query(f"SELECT attempts FROM public.ai_usage WHERE user_id='{user_id}'") == '1'
    identity = f"SET LOCAL ROLE authenticated; SET LOCAL \"request.jwt.claim.sub\"='{user_id}';"
    contention(
        f"BEGIN; {identity} SELECT public.update_my_preferences('{{\"theme\":\"dark\"}}'); SELECT pg_sleep(3); COMMIT;",
        f"BEGIN; {identity} SELECT public.update_my_preferences('{{\"themeColorIndex\":2}}'); COMMIT;"
    )
    stored = json.loads(query(f"SELECT preferences FROM public.people WHERE user_id='{user_id}'"))
    assert stored == {'futureKey': 'keep', 'theme': 'dark', 'themeColorIndex': 2}, stored
    print('PASS PostgreSQL actual locks: quota permits exactly one attempt; concurrent preferences preserve both patches and unknown keys.')
finally:
    query(f"DELETE FROM public.people WHERE user_id='{user_id}'; DELETE FROM auth.users WHERE id='{user_id}';")
