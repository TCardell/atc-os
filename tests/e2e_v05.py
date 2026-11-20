from playwright.sync_api import sync_playwright
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def assemble():
 html=(ROOT/'index.html').read_text()
 for css in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
  html=html.replace(f'<link rel="stylesheet" href="{css}">',f'<style>{(ROOT/css).read_text()}</style>')
 for js in re.findall(r'<script defer src="([^"]+)"></script>',html):
  html=html.replace(f'<script defer src="{js}"></script>',f'<script>{(ROOT/js).read_text()}</script>')
 return html

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':850},accept_downloads=True)
 errors=[]
 page.on('pageerror',lambda err: errors.append(str(err)))
 page.evaluate('''()=>{const map=new Map();window.__map=map;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}})}''');page.set_content(assemble(),wait_until='load')
 page.wait_for_selector('#loginScreen:not([hidden])',timeout=8000)
 page.screenshot(path='tests/v05_login.png')
 page.fill('#loginName','Alumno de prueba')
 page.click('#loginProceed')
 page.wait_for_selector('#startScreen:not([hidden])')
 page.fill('#companyInput','Prisma Demo')
 page.click('#setupNext')
 page.click('#startBtn')
 page.wait_for_selector('#appShell:not([hidden])')
 print('DESKTOP',page.locator('#taskbarApps button').count(), 'icons',page.locator('#desktopIcons button').count())
 page.screenshot(path='tests/v05_desktop.png')
 assert page.locator('#taskbarApps button').count()==0
 assert page.locator('#desktopIcons .desktop-shortcut').count()==0
 page.click('#taskStart')
 assert page.locator('#startMenu:not([hidden])').count()==1
 page.screenshot(path='tests/v05_start.png')
 # task app
 page.locator('[data-os-open="tasks"]').last.click()
 print('TASKAPP',page.locator('.todo-item').count(), 'taskbar',page.locator('#taskbarApps button').count())
 page.screenshot(path='tests/v05_tasks.png')
 assert page.locator('.todo-item').count()>=3
 # Files app
 page.click('#taskStart');page.locator('#startAppGrid [data-os-open="directory"]').click()
 page.screenshot(path='tests/v05_files.png')
 page.locator('[data-vfs-cmd="newfolder"]').click()
 # should have dialog handler; missed it until click; auto dismissed? default prompt auto canceled in playwright
 print('FILES',page.locator('.vfs-app').count(),'ERROR',errors)
 page.click('#taskStart');page.locator('#startAppGrid [data-os-open="email"]').click()
 # email app open, may be obscured by existing window? JS click on desktop background if window covers; use start
 print('MAIL',page.locator('.email-client').count())
 page.screenshot(path='tests/v05_mail.png')
 page.click('#taskStart')
 page.click('#startPower')
 print('POWER menu visible',page.locator('#powerMenu:not([hidden])').count())
 page.screenshot(path='tests/v05_power.png')
 assert page.locator('#powerMenu:not([hidden])').count()==1
 # Reload and resume
 page.set_content(assemble(),wait_until='load')
 page.wait_for_selector('#loginScreen:not([hidden])',timeout=8000)
 assert page.locator('#savedProfile:not([hidden])').count()==1
 page.click('#savedProfile')
 page.wait_for_selector('#appShell:not([hidden])',timeout=8000)
 assert page.locator('#taskbarApps button').count()==0
 print('RESUME',page.locator('#desktopCompany').inner_text())
 assert not errors,errors
 browser.close()
