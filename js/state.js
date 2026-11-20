window.AtCOS=window.AtCOS||{};
AtCOS.Store=(()=>{
 const KEY='atc-os-session-v1',LEGACY_KEY='central-clientes-2-pilot-v1',VERSION=2;
 let available=true;
 function get(){try{const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY);if(!raw)return null;const s=JSON.parse(raw);if(!validate(s))return null;if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(s));return s}catch(e){available=false;return null}}
 function validate(s){return !!(s&&(s.version===1||s.version===VERSION)&&typeof s.student==='string'&&typeof s.company==='string'&&Array.isArray(s.cases)&&s.cases.every(c=>typeof c.id==='string'&&Array.isArray(c.messages)&&Array.isArray(c.actions))&&typeof s.session==='string')}
 function save(s){if(!s)return false;try{localStorage.setItem(KEY,JSON.stringify(s));available=true;return true}catch(e){available=false;return false}}
 function clear(){try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY)}catch(e){available=false}}
 function status(){return available}
 return {get,save,clear,status,validate};
})();
