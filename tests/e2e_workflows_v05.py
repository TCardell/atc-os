from playwright.sync_api import sync_playwright
from pathlib import Path
from pypdf import PdfReader
import re
ROOT=Path(__file__).resolve().parents[1]
def assemble():
 h=(ROOT/'index.html').read_text()
 for css in re.findall(r'<link rel="stylesheet" href="([^"]+)">',h):h=h.replace(f'<link rel="stylesheet" href="{css}">',f'<style>{(ROOT/css).read_text()}</style>')
 for js in re.findall(r'<script defer src="([^"]+)"></script>',h):h=h.replace(f'<script defer src="{js}"></script>',f'<script>{(ROOT/js).read_text()}</script>')
 return h
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':850},accept_downloads=True)
 page.evaluate('''()=>{let m=new Map();window.__m=m;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})}''')
 errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
 page.on('dialog',lambda dialog:dialog.accept('Carpeta ensayo'))
 page.set_content(assemble(),wait_until='load')
 page.wait_for_selector('#loginScreen:not([hidden])')
 page.fill('#loginName','María José Núria');page.click('#loginProceed');page.fill('#companyInput','Croma Gràfic');page.click('#startBtn');page.wait_for_selector('#appShell:not([hidden])')
 # Settings changes
 page.click('#taskStart');page.locator('#startAppGrid [data-os-open="settings"]').click()
 page.locator('select[data-os-setting="wallpaper"]').select_option('nocturne')
 page.locator('select[data-os-setting="lang"]').select_option('ca')
 page.click('[data-os-settings-save]')
 assert page.locator('#appShell').get_attribute('data-wallpaper')=='nocturne'
 assert page.evaluate('AtCOS.Engine.get().lang')=='ca'
 # filesystem
 page.click('#taskStart');page.locator('#startAppGrid [data-os-open="directory"]').click()
 page.click('[data-vfs-folder="orders"]')
 page.click('[data-vfs-cmd="newfolder"]')
 assert page.locator('.vfs-item').count()==1
 n=page.evaluate("AtCOS.VFS.list('orders')[0]")
 assert n['name']=='Carpeta ensayo'
 page.evaluate("AtCOS.VFS.rename(AtCOS.VFS.list('orders')[0].id,'Proyecto Laura')")
 page.evaluate("AtCOS.VFS.move(AtCOS.VFS.list('orders')[0].id,'desktop')")
 page.click('#taskStart');page.locator('#startAppGrid [data-os-open="directory"]').click()
 assert page.evaluate("AtCOS.VFS.list('desktop').some(n=>n.name==='Proyecto Laura')")
 page.evaluate("AtCOS.VFS.move(AtCOS.VFS.list('desktop')[0].id,'trash')")
 page.evaluate("AtCOS.VFS.restore(AtCOS.VFS.list('trash')[0].id)")
 assert page.evaluate("AtCOS.VFS.list('desktop').some(n=>n.name==='Proyecto Laura')")
 # simulated PDF from order -> actual PDF physically downloaded
 page.evaluate("AtCOS.VFS.saveAttachment('P-1847')")
 doc=page.evaluate("AtCOS.VFS.list('downloads')[0]")
 assert doc['mime']=='application/pdf'
 with page.expect_download() as dl:
  page.evaluate("AtCOS.VFS.download(AtCOS.VFS.list('downloads')[0].id)")
 d=dl.value;out=ROOT/'tests'/'v05_client_attachment.pdf';d.save_as(str(out))
 assert '%PDF-' in out.read_bytes()[:10].decode()
 assert len(PdfReader(str(out)).pages)==1
 # attach to email
 page.evaluate("AtCOS.VFS.attach('email01', AtCOS.VFS.list('downloads')[0].id)")
 assert page.evaluate("AtCOS.Engine.caseState('email01').attachments.length")==1
 # email, send and generate report via power
 page.click('#taskStart');page.locator('#startAppGrid [data-os-open="email"]').click()
 page.locator('[data-os-win="email"] [data-case="email01"]').first.click()
 assert page.locator('[data-os-win="email"] .email-queued-attachments').count()==1
 page.locator('[data-draft="email01"]').fill('Bon dia. Hem rebut la vostra consulta i revisarem les condicions abans de confirmar la data d’entrega.')
 page.locator('[data-send="email01"]').click()
 assert page.evaluate("AtCOS.Engine.caseState('email01').messages.filter(m=>m.role==='student')[0].attachments.length")==1
 page.click('#taskStart');page.click('#startPower');page.locator('[data-power="shutdown"]').click()
 assert page.evaluate('AtCOS.Engine.get().finalized')
 assert page.locator('[data-os-win="report"] #pdfDownloadLink').count()==1
 with page.expect_download() as dl:
  page.locator('#pdfDownloadLink').click()
 path=ROOT/'tests'/'v05_report.pdf';dl.value.save_as(str(path))
 pdf=PdfReader(str(path));text='\n'.join(x.extract_text() for x in pdf.pages)
 assert 'María José Núria' in text and 'Gestió de fitxers' in text and 'tarjetas' in text
 print('OK',{'pdf_pages':len(pdf.pages),'filesystem_actions':page.evaluate('AtCOS.Engine.get().fileActions.length'),'saved_file':str(out),'js_errors':errors})
 assert not errors
 browser.close()
