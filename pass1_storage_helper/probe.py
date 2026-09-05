import os, urllib.request, urllib.error
u=os.environ['TARGET_URL']; j=os.environ['ANON_JWT']
req=urllib.request.Request(u,headers={'Authorization':'Bearer '+j,'apikey':j})
try:
    r=urllib.request.urlopen(req,timeout=30)
    print('HTTP',r.status,flush=True)
    print(r.read().decode()[:4000],flush=True)
except urllib.error.HTTPError as e:
    print('HTTP',e.code,flush=True)
    print(e.read().decode()[:4000],flush=True)
    raise
