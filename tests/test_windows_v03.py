from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
# Importing test_app executes tests, so assemble independently.
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text()
for css in ['css/app.css','css/desktop.css']:
 html=html.replace(f'<link rel="stylesheet" href="{css}">',f'<style>{(BASE/css).read_text()}</style>')
for js in __import__('re').findall(r'<script defer src="([^"]+)"></script>',html):
 html=html.replace(f'<script defer src="{js}"></script>',f'<script>{(BASE/js).read_text()}</script>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':900})
 page=ctx.new_page();page.set_default_timeout(11000);errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html)
 page.fill('#studentInput','Prueba del escritorio');page.fill('#companyInput','La Empresa Gráfica');page.click('#startBtn')
 assert page.locator('#desktopShortcuts').count()==0
 assert page.locator('.os-app-icon .ov-icon').count()>=10
 assert page.locator('#taskbarApps button').count()==8
 page.screenshot(path=str(BASE/'tests/v03_desktop.png'))
 # free drag & resize
 page.locator('#taskbarApps [data-os-open="phone"]').click()
 phone=page.locator('.os-window[data-os-win="phone"]')
 orig=phone.bounding_box();handle=phone.locator('[data-resize="se"]').bounding_box()
 page.mouse.move(handle['x']+handle['width']/2,handle['y']+handle['height']/2)
 page.mouse.down();page.mouse.move(handle['x']+handle['width']/2-125,handle['y']+handle['height']/2-120,steps=12);page.mouse.up()
 resized=phone.bounding_box()
 print('FREE RESIZE BEFORE AFTER',orig,resized)
 assert resized['width']<orig['width']-80 and resized['height']<orig['height']-60
 title=phone.locator('[data-drag-title="phone"]')
 bar=title.bounding_box()
 page.mouse.move(bar['x']+240,bar['y']+20);page.mouse.down();page.mouse.move(bar['x']+330,bar['y']+110,steps=14);page.mouse.up()
 moved=phone.bounding_box()
 print('FREE DRAG',resized,moved)
 assert moved['x']>resized['x']+40
 # menu snap, two-pane ratio
 page.locator('#taskbarApps [data-os-open="email"]').click()
 page.locator('[data-os-win="email"] [data-window-action="menu"]').click()
 assert page.locator('#snapMenu').is_visible()
 page.locator('#snapMenu [data-window-action="left"]').click()
 assert 'is-snapped-left' in page.locator('[data-os-win="email"]').get_attribute('class')
 page.locator('#taskbarApps [data-os-open="directory"]').click()
 page.locator('[data-os-win="directory"] [data-window-action="menu"]').click()
 page.locator('#snapMenu [data-window-action="right"]').click()
 assert page.locator('#tileDivider').is_visible()
 before=page.locator('[data-os-win="email"]').bounding_box()
 div=page.locator('#tileDivider').bounding_box()
 page.mouse.move(div['x']+div['width']/2,div['y']+div['height']/2)
 page.mouse.down();page.mouse.move(div['x']+div['width']/2+130,div['y']+div['height']/2,steps=14);page.mouse.up()
 after=page.locator('[data-os-win="email"]').bounding_box()
 print('SPLIT RESIZE BEFORE AFTER',before,after)
 assert after['width']>before['width']+80
 page.screenshot(path=str(BASE/'tests/v03_split.png'))
 # drag free phone to right edge: windows overlap, first activate phone
 page.locator('#taskbarApps [data-os-open="phone"]').click()
 bar=phone.locator('.os-titlebar').bounding_box()
 page.mouse.move(bar['x']+210,bar['y']+20);page.mouse.down()
 page.mouse.move(1432,350,steps=22)
 # verify visual preview
 print('PREVIEW',page.locator('.os-drop-preview').get_attribute('class'))
 page.mouse.up()
 print('DRAG SNAP',phone.get_attribute('class'))
 assert 'is-snapped-right' in phone.get_attribute('class')
 # new snap supersedes directory, not email
 assert 'is-snapped-right' not in page.locator('[data-os-win="directory"]').get_attribute('class')
 # ensure no duplicate text in desk and handled attachment action
 page.locator('#taskbarApps [data-os-open="email"]').click()
 page.locator('[data-os-win="email"] [data-case="email01"]').first.click()
 attachment=page.locator('[data-os-win="email"] .email-attachment').first
 attachment.click()
 actions=page.evaluate("AtCOS.Engine.caseState('email01').actions.map(a=>a.type)")
 print('ATTACHMENT ACTION',actions)
 assert 'consultFile' in actions
 print('JS_ERRORS',errors)
 assert not errors
 b.close()
