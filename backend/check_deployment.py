"""Validate settings without printing database URLs, credentials or tokens."""
import os
import sys
from pydantic import ValidationError

if '--production' in sys.argv:
    os.environ['VERCEL']='1'
try:
    from app.config import config
except ValidationError as error:
    for item in error.errors(include_input=False):
        print('Configuration error: '+'.'.join(map(str,item['loc']))+': '+item['msg'])
    raise SystemExit(1)
except RuntimeError as error:
    print(str(error))
    raise SystemExit(1)
print('Backend configuration passed ('+('production' if os.getenv('VERCEL')=='1' else 'local')+'). No secret values printed.')
