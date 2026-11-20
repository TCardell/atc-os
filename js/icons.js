/* Iconografía vectorial propia de Oficina Virtual 0.3.
   Todas las figuras son SVG inline: nítidas a cualquier escala, sin fuentes ni CDN. */
window.AtCOS=window.AtCOS||{};
AtCOS.Icons=(()=>{
 const shapes={
  inbox:'<path d="M3 4h18v15H3Z"/><path d="M3 14h5l2 3h4l2-3h5"/>',
  dashboard:'<rect x="3" y="3" width="8" height="8" rx="1.8"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.8"/><rect x="3" y="13" width="8" height="8" rx="1.8"/>',
  email:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m3.6 7 8.4 6 8.4-6"/><path d="M4.5 17.5 9 14.5m10.5 3-4.5-3"/>',
  messages:'<path d="M20.6 11.4c0 4.8-4.1 8.4-9.1 8.4-1.4 0-2.5-.2-3.6-.6L3 21l1.4-4.2a8.3 8.3 0 0 1-2-5.4c0-4.8 4.1-8.7 9.1-8.7s9.1 3.9 9.1 8.7Z"/><path d="M7.5 11.5h8.3m-8.3-3h5.3m-5.3 6h6"/>',
  phone:'<path d="M6.8 3.1 10 6.8 8.3 9.2c1.5 3 3.5 5 6.5 6.5l2.5-1.7 3.6 3.4-1.3 3.1c-.5 1.1-1.6 1.4-2.8 1.1C10.7 19.6 4.5 13.3 2.4 7c-.3-1.1.1-2.2 1.1-2.7l3.3-1.2Z"/>',
  social:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.6" r="1" fill="currentColor" stroke="none"/>',
  directory:'<path d="M3 7a2 2 0 0 1 2-2h4l2.3 2.2H19a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 11h18"/>',
  tasks:'<path d="M9 6h12M9 12h12M9 18h12M3 6l1.5 1.5L7 4m-4 8 1.5 1.5L7 10m-4 8 1.5 1.5L7 16"/>',
  report:'<path d="M7 2.7h7l5 5V21H5V4.7a2 2 0 0 1 2-2Z"/><path d="M14 2.7V8h5M8.5 12h7m-7 3.5h7m-7 3.3h5"/>',
  power:'<path d="M12 2v10M6 5.5a9 9 0 1 0 12 0"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
  start:'<path d="M5.1 4.2c0-.6.5-1.1 1.1-1.1h4.5v7.3H3.4V6.2c0-.6.6-1.2 1.7-2Z" fill="currentColor" stroke="none"/><path d="M13.3 3.1h4.5c.6 0 1.1.5 1.1 1.1l1.7 2c.3.5 0 1.1-.6 1.1h-6.7V3.1Z" fill="currentColor" stroke="none"/><path d="M3.4 13.4h7.3v7.3H6.2c-.6 0-1.1-.5-1.1-1.1l-1.7-2.1v-4.1Z" fill="currentColor" stroke="none"/><path d="M13.3 13.4h7.3v4.1l-1.7 2.1c0 .6-.5 1.1-1.1 1.1h-4.5v-7.3Z" fill="currentColor" stroke="none"/>',
  search:'<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/>',
  bell:'<path d="M6.2 17.5h11.6l-1.3-2.4v-4.3a4.5 4.5 0 0 0-9 0v4.3l-1.3 2.4Z"/><path d="M10 20h4"/>',
  moon:'<path d="M20.7 14.5A8.8 8.8 0 0 1 9.5 3.3 8.8 8.8 0 1 0 20.7 14.5Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1.8v2.5M12 19.7v2.5M1.8 12h2.5m15.4 0h2.5M4.8 4.8l1.8 1.8m10.8 10.8 1.8 1.8M19.2 4.8l-1.8 1.8M6.6 17.4l-1.8 1.8"/>',
  minus:'<path d="M5 12h14"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>',
  maximize:'<rect x="4.3" y="4.3" width="15.4" height="15.4" rx="2"/>',
  restore:'<path d="M8 7V4.5h12v12h-2.5"/><rect x="4" y="8" width="12" height="12" rx="1.5"/>',
  snap:'<rect x="3" y="3" width="18" height="18" rx="2.4"/><path d="M12 3v18"/>',
  left:'<rect x="3" y="3" width="18" height="18" rx="2.4"/><path d="M12 3v18"/><path d="M6.7 11.5 9 9m-2.3 2.5L9 14"/>',
  right:'<rect x="3" y="3" width="18" height="18" rx="2.4"/><path d="M12 3v18"/><path d="m17.3 11.5-2.3-2.5m2.3 2.5L15 14"/>',
  tile:'<rect x="3" y="3" width="18" height="18" rx="2.4"/><path d="M12 3v18m-9-9h18"/>',
  check:'<path d="m4 12 5.2 5.2L20 6.5"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/>',
  arrowRight:'<path d="M4 12h16m-6-6 6 6-6 6"/>',arrowLeft:'<path d="M20 12H4m6-6-6 6 6 6"/>',
  external:'<path d="M13 4h7v7m0-7-9.5 9.5"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
  send:'<path d="m3 11.7 18-8.3-6.5 17-3.7-7-7.8-2.7Z"/><path d="m10.8 13.4 10.1-10"/>',
  reply:'<path d="m10 8-6 5 6 5"/><path d="M4 13h10c4 0 6 2 6 6"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3"/>',
  folder:'<path d="M2.8 7.2a2 2 0 0 1 2-2h5l2.2 2.2h7.2a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H4.8a2 2 0 0 1-2-2Z"/>',
  file:'<path d="M7 3h7l5 5v13H5V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8.5 12h7m-7 3.5h7"/>',
  paperclip:'<path d="m8 12.5 6.6-6.6a3.2 3.2 0 0 1 4.5 4.5l-8.5 8.5a5.1 5.1 0 0 1-7.2-7.2l8.5-8.5"/>',
  heart:'<path d="M20.4 5.8a5.1 5.1 0 0 0-7.2 0L12 7l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8a5.1 5.1 0 0 0 0-7.2Z"/>',
  star:'<path d="m12 2.7 2.9 6 6.7.9-4.8 4.7 1.1 6.7-5.9-3.1-5.9 3.1 1.1-6.7-4.8-4.7 6.7-.9Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0M16 6.5a3 3 0 0 1 0 5.8M16.8 14a5.5 5.5 0 0 1 4.7 5"/>',
  package:'<path d="m12 2.7 9 4.8v9L12 21l-9-4.5v-9Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9m-4.5-16L16.5 10"/>',
  book:'<path d="M12 20.5c-2-2-5-3-9-2.4V4.5c4-.5 7 0 9 2.3m0 13.7c2-2 5-3 9-2.4V4.5c-4-.5-7 0-9 2.3m0 0v13.7"/>',
  settings:'<path d="M10.2 2.6h3.6l.7 2.4 2 .8 2.2-1.1 2.5 2.5-1.2 2.2.8 2 2.4.7v3.7l-2.4.7-.8 2 1.2 2.2-2.5 2.5-2.2-1.2-2 .9-.7 2.4h-3.6l-.7-2.4-2-.9-2.2 1.2-2.5-2.5 1.2-2.2-.8-2-2.4-.7v-3.7l2.4-.7.8-2-1.2-2.2 2.5-2.5 2.2 1.1 2-.8.7-2.4Z"/><circle cx="12" cy="12" r="3.6" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/>',
  edit:'<path d="m4 16 10-10 4 4-10 10-5 1Z"/><path d="m12 8 4 4M15.5 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1"/>',
  alert:'<path d="M12 3 2.6 20h18.8Z"/><path d="M12 9v5m0 3v.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.3"/>',
  sparkles:'<path d="m12 2 2.3 6.2L20.5 10.5l-6.2 2.3L12 19l-2.3-6.2-6.2-2.3 6.2-2.3Zm8 14 .8 1.9L22.7 19l-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-1.1Z"/>',
  clipboard:'<rect x="5" y="5" width="14" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="5" rx="1"/><path d="M9 12h6m-6 4h6"/>',
  fileSearch:'<path d="M7 3h7l5 5v6M14 3v5h5M5 5v13M9 12h4"/><circle cx="15" cy="17" r="4"/><path d="m18 20 3 3"/>',
  rotate:'<path d="M20 11a8 8 0 1 1-2.2-5.5M20 3v6h-6"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
 };
 const svg=(name,{size=20,className='',title=''}={})=>{
  const content=shapes[name]||shapes.info;
  return `<svg class="ov-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${content}</svg>`;
 };
 const colors={dashboard:'#7561E9',email:'#3B83F5',messages:'#0EAA8D',phone:'#1B94C9',tasks:'#4EA399',settings:'#8D6CCA',social:'#D950A7',directory:'#D1A04A',report:'#438CA9'};
 const app=id=>`<span class="os-app-icon" style="--app-color:${colors[id]||'#6573de'}">${svg(id,{size:22})}</span>`;
 return {svg,app,colors};
})();
