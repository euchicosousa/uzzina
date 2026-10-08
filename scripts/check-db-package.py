"""Validate the real SQL package against an exported baseline in local PostgreSQL15.
Usage: python3 scripts/check-db-package.py /path/to/pg/bin /private/socket inventory.csv
Does not connect to production or start/install a PostgreSQL service.
"""
from pathlib import Path
import subprocess
import sys
import tempfile
import uuid

pg_bin, socket, inventory = sys.argv[1:]
if not Path(socket).is_absolute():
    raise SystemExit('An explicit local socket path is required; no network database supported')
root = Path(__file__).resolve().parent.parent
database = 'uzzina_test_' + uuid.uuid4().hex[:12]
logs = Path(tempfile.mkdtemp(prefix='uzzina-db-check-'))
connection = ['-h', socket, '-p', '55432', '-U', 'postgres', '-d', database]
psql = [str(Path(pg_bin) / 'psql'), '-X', *connection, '-v', 'ON_ERROR_STOP=1']
subprocess.run([str(Path(pg_bin) / 'createdb'), '-h', socket, '-p', '55432', '-U', 'postgres', database], check=True)


def run(label, args):
    with (logs / (label + '.log')).open('w') as output:
        subprocess.run(args, stdout=output, stderr=subprocess.STDOUT, check=True)
    print('PASS', label, flush=True)


try:
    with (logs / 'baseline.sql').open('w') as output:
        subprocess.run([sys.executable, str(root / 'scripts/build-db-test-baseline.py'), inventory], stdout=output, check=True)
    run('baseline', psql + ['-1', '-f', str(logs / 'baseline.sql')])
    for migration in sorted((root / 'supabase/migrations').glob('*.sql')):
        # Files already containing a transaction manage it themselves.
        sql = migration.read_text()
        transaction = [] if '\nBEGIN;' in sql else ['-1']
        run(migration.stem, psql + transaction + ['-f', str(migration)])
    run('authorization-matrix', psql + ['-f', str(root / 'scripts/test-database-matrix.sql')])
    run('two-connection-locks', [sys.executable, str(root / 'scripts/check-db-concurrency.py'), str(Path(pg_bin) / 'psql'), socket, database])
    counts = subprocess.check_output(psql + ['-At', '-c', 'SELECT count(*) FROM auth.users; SELECT count(*) FROM public.people; SELECT count(*) FROM public.actions; SELECT count(*) FROM public.ai_usage;'], text=True).splitlines()
    if counts != ['0', '0', '0', '0']:
        raise AssertionError('Test fixtures were not cleaned: ' + repr(counts))
    print('PASS fixture cleanup; PostgreSQL package checks complete. GoTrue/PostgREST/Vercel not certified.')
    print('Logs:', logs)
except Exception:
    print('Failure logs:', logs, 'Database retained for diagnosis:', database, file=sys.stderr)
    raise
else:
    subprocess.run([str(Path(pg_bin) / 'dropdb'), '-h', socket, '-p', '55432', '-U', 'postgres', database], check=True)
