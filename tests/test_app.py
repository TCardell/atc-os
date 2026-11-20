from pathlib import Path
from playwright.sync_api import sync_playwright
from pypdf import PdfReader
BASE=Path(__file__).resolve().parents[1]

def assemble():
 html=(BASE/'index.html').read_text()
 for css in ['css/app.css','css/desktop.css']:
  html=html.replace(f'<link rel="stylesheet" href="{css}">',f'<style>{(BASE/css).read_text()}</style>')
 for js in __import__('re').findall(r'<script defer src="([^"]+)"></script>',html):
  html=html.replace(f'<script defer src="{js}"></script>',f'<script>{(BASE/js).read_text()}</script>')
 return html

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for lang in ['es','ca']:
  ctx=browser.new_context(viewport={'width':1360,'height':850},accept_downloads=True)
  page=ctx.new_page();page.set_default_timeout(9000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{
   const map=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:(k)=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:(k)=>map.delete(k)}});
  }''')
  page.set_content(assemble(),wait_until='load')
  assert page.locator('.swatch').count()==12 and page.locator('.emoji-option').count()==12
  page.select_option('#langSelect',lang)
  # color deselect -> multi, emoji deselect -> △
  page.locator('.swatch').first.click();page.locator('.swatch').first.click()
  assert page.evaluate("document.body.classList.contains('brand-multi')")
  page.locator('.emoji-option').first.click();page.locator('.emoji-option').first.click()
  page.locator('.emoji-option').nth(4).click()
  page.click('#randomCompanyBtn')
  page.fill('#studentInput','María José Núria')
  page.click('#startBtn')
  assert page.locator('.os-window').count()==1
  saved=page.evaluate("({ok:AtCOS.Store.status(),emoji:AtCOS.Engine.get().emoji,name:AtCOS.Engine.get().company,stored:localStorage.getItem('atc-os-session-v1')?.length})")
  print(lang,'storage',saved)
  assert saved['ok'] and saved['stored']>150
  # OS details: email drafts persist across switching, app window dragging and split
  page.locator('#taskStart').click()
  page.locator('#startSearch').fill('Laura')
  assert page.locator('#startResults .start-result-row').count()>=1
  page.locator('#startResults .start-result-row').first.click()
  assert page.locator('.os-window[data-os-win="email"]').count()==1
  page.locator('[data-os-win="email"] [data-case="email01"]').first.click()
  page.locator('[data-os-win="email"] [data-draft="email01"]').fill('Bon dia, consultarem el vostre encàrrec abans de confirmar terminis i canvis. Gràcies!')
  page.locator('#taskbarApps [data-os-open="phone"]').click()
  assert page.locator('.os-window[data-os-win="phone"]').count()==1
  page.locator('#taskbarApps [data-os-open="email"]').click()
  assert 'Bon dia' in page.locator('[data-os-win="email"] [data-draft="email01"]').input_value()
  page.locator('[data-os-win="email"] [data-window-action="menu"]').click()
  assert page.locator('#snapMenu').is_visible()
  page.locator('#snapMenu [data-window-action="split"]').click()
  assert 'is-snapped-right' in page.locator('.os-window[data-os-win="directory"]').get_attribute('class')
  assert 'is-snapped-left' in page.locator('.os-window[data-os-win="email"]').get_attribute('class')
  page.locator('[data-os-win="directory"] [data-dir-folder="orders"]').first.click()
  page.locator('[data-os-win="directory"] [data-dir-preview="order:P-1847"]').click()
  assert page.locator('[data-os-win="directory"] .files-preview').count()==1
  # Complete cases with preprogrammed open-text responses (none are auto-rated)
  result=page.evaluate('''()=>{
    const E=AtCOS.Engine,D=AtCOS.Data;
    for(const d of D.cases){const c=E.caseState(d.id);
      if(!c.revealed){throw Error('Unexpected unrevealed '+d.id)}
      E.select(d.id);
      if(d.id==='social01')E.action(d.id,'openPrivate');
      for(let j=0;j<10&&!c.complete;j++){
       const ans=E.send(d.id,'Buenos días, gracias por su consulta. Vamos a revisar la información y confirmar una respuesta profesional basada en datos comprobados.');
       if(!ans.ok)throw Error('send failed '+d.id+' '+j);
      }
      if(!c.complete)throw Error('Not completed '+d.id);
    }
    E.finish();return {cnt:E.counts(),events:E.get().events.length,pdf:AtCOS.PDF.build(E.get()).size,emoji:E.get().emoji}
  }''')
  print(lang,'finished',result,'JS',errors)
  assert result['cnt']['done']==6 and result['pdf']>8000 and not errors
  page.locator('#taskbarApps [data-os-open="report"]').click()
  assert page.locator('.os-window[data-os-win="report"]').count()==1
  path=BASE/'tests'/f'cc2v03_full_report_{lang}.pdf'
  with page.expect_download(timeout=18000) as dl:
   page.locator('[data-os-win="report"] #pdfDownloadLink').click()
  dl.value.save_as(str(path))
  r=PdfReader(path)
  content='\n'.join(x.extract_text() for x in r.pages)
  print(lang,'PDF pages',len(r.pages),'size',path.stat().st_size,'accent name',('María José Núria' in content),'resps',content.count('Buenos días'))
  assert len(r.pages)>=2 and 'María José Núria' in content and 'P-1847' in content and content.count('Buenos días')>=5
  page.screenshot(path=str(BASE/'tests'/f'cc2v03_final_{lang}.png'))
  ctx.close()
 browser.close()
