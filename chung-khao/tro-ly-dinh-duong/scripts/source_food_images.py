"""Fetch reviewed Commons files with attribution alongside local assets."""
import html, json, re, time, urllib.parse, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
FILES = {
 'rice':'A bowl of rice.jpg', 'chicken':'020240103 Boiled chicken breast.jpg',
 'beef':'Roastbeef.jpg', 'egg':'Boiled Egg - Crossection.jpg',
 'fish':'Homemade steamed fish in dinner.jpg', 'tofu':'Japanese SilkyTofu (Kinugoshi Tofu).JPG',
 'vegetable':'Steamed broccoli and red cabbage - Col roja y brécol al vapor (4817782946).jpg',
 'banana':'Banana-Single.jpg', 'milk':'Glass of Milk (33657535532).jpg',
 'sweetpotato':'Batata cocida de las chacras de Capioví.jpg', 'peanut':'Roasted Groundnuts.jpg', 'oil':'Olive oil from Oneglia.jpg',
}
def fetch(url):
 for attempt in range(3):
  try: return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'BuaVietDemo/0.1'}), timeout=30).read()
  except Exception:
   if attempt == 2: raise
   time.sleep(3)
params={'action':'query','titles':'|'.join('File:'+name for name in FILES.values()),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':640,'format':'json'}
data=json.loads(fetch('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)))
pages={page['title']:page for page in data['query']['pages'].values()}
out=ROOT/'public/images/foods';out.mkdir(parents=True,exist_ok=True)
manifest={}
def plain(value): return html.unescape(re.sub('<[^>]+>', '', value)).strip()
for key,name in FILES.items():
 info=pages['File:'+name]['imageinfo'][0];meta=info['extmetadata']
 license=plain(meta.get('LicenseShortName',{}).get('value',''))
 if not license: raise ValueError('Missing license: '+name)
 content=fetch(info.get('thumburl',info['url']))
 if not content.startswith(b'\xff\xd8'): raise ValueError('Expected JPEG: '+name)
 (out/(key+'.jpg')).write_bytes(content)
 manifest[key]={'src':'/images/foods/'+key+'.jpg','source':info['descriptionurl'],'author':plain(meta.get('Artist',{}).get('value','')),'license':license,'licenseUrl':meta.get('LicenseUrl',{}).get('value',''),'original':info['url'],'changes':'Wikimedia thumbnail, CSS crop for display.','retrieved':'2026-10-06'}
 print(key,license,len(content),flush=True)
(out/'credits.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'src/data/foodImages.ts').write_text('export type FoodImage = { src: string; source: string; author: string; license: string; licenseUrl: string; original: string; changes: string; retrieved: string };\nexport const foodImages: Record<string, FoodImage> = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
