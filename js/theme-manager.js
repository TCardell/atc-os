/* Apariencia aislada del motor de escenarios, ventanas y archivos. */
window.AtCOS=window.AtCOS||{};
AtCOS.ThemeManager=(()=>{
 const KNOWN=new Set(['modern','retro98']);
 let current='modern';
 function apply(theme){current=KNOWN.has(theme)?theme:'modern';document.body.dataset.osTheme=current;document.documentElement.dataset.osTheme=current;return current}
 return {apply,get:()=>current,available:()=>[...KNOWN]};
})();
