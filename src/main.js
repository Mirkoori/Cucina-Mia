import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./style.css";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { initProdotti } from "./prodotti.js";
import { art } from "./art.js";
import { MESI, MES3, MES3L, LET, V, BY, CATS } from "./data.js";
import { REGIONI, RC, TIPI, RICETTE } from "./ricette.js";
import { initMenu } from "./menu.js";
import { leggiFoto, dividiTesto } from "./ocr.js";

var NOW=new Date(), NOW_M=NOW.getMonth()+1;
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}

/* ---------- icone ---------- */
var IC={
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></svg>',
  heartOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></svg>'
};

/* ---------- stato e salvataggio ---------- */
var state={month:NOW_M,seg:"stagione",cat:"Tutti",q:"",
  rseg:"regioni",rreg:"Tutte",rtipo:"Tutte",rq:"",
  sheet:null,stack:[],edit:null};
var STORE_KEY="cucinamia-dati";
var DB={fav:[],mine:[],over:{},menus:[]};
var lastFocus=null, toastT=null;
async function loadDB(){
  var raw=null;
  try{raw=(await Preferences.get({key:STORE_KEY})).value}catch(e){}
  if(!raw){try{raw=localStorage.getItem(STORE_KEY)}catch(e){}}
  try{var d=JSON.parse(raw);if(d&&typeof d==="object"){DB.fav=Array.isArray(d.fav)?d.fav:[];DB.mine=Array.isArray(d.mine)?d.mine:[];DB.over=d.over&&typeof d.over==="object"?d.over:{};DB.menus=Array.isArray(d.menus)?d.menus.filter(function(m){return m&&typeof m.id==="string"&&Array.isArray(m.rec)}).map(function(m){return {id:m.id,n:String(m.n||"Menu"),pers:+m.pers||4,rec:m.rec,done:m.done&&typeof m.done==="object"?m.done:{}}}):[]}}catch(e){}
}
function saveDB(){
  var s=JSON.stringify(DB);
  try{Preferences.set({key:STORE_KEY,value:s}).catch(function(){})}catch(e){}
  try{localStorage.setItem(STORE_KEY,s)}catch(e){toast("Spazio pieno: prova a togliere qualche foto")}
}
function toast(msg){var t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},2600)}

/* ---------- ricette ---------- */
function linkIng(r){r.ing=(r.ing||[]).map(function(i){if(i[3]||!i[2])return i;var id=matchIng(i[2]);return id?[i[0],i[1],i[2],id]:i});return r}
function baseRecipes(){return RICETTE.map(function(r){return DB.over[r.id]?Object.assign({},DB.over[r.id],{id:r.id,orig:true,edited:true,storia:r.storia}):Object.assign({orig:true},r)})}
function allRecipes(){return baseRecipes().concat(DB.mine.map(function(r){return Object.assign({},r,{user:true})})).map(linkIng)}
function getRecipe(id){if(sharedTmp&&id===sharedTmp.id)return sharedTmp;return allRecipes().filter(function(r){return r.id===id})[0]}
function isFav(id){return DB.fav.indexOf(id)>-1}
function safeImg(s){return typeof s==="string"&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(s)?s:null}
function fmtMin(m){m=+m||0;if(m<60)return m+" min";var h=Math.floor(m/60),r=m%60;return h+" h"+(r?" "+r:"")}
var DIF=["Facile","Media","Impegnativa"];
var SING={cucchiai:"cucchiaio",cucchiaini:"cucchiaino",spicchi:"spicchio",bustine:"bustina",bicchieri:"bicchiere",tazze:"tazza",rametti:"rametto",foglie:"foglia",fette:"fetta",mazzi:"mazzo"};
var UNITS={kg:"kg",g:"g",gr:"g",ml:"ml",l:"l",dl:"dl",cl:"cl",cucchiaio:"cucchiai",cucchiai:"cucchiai",cucchiaino:"cucchiaini",cucchiaini:"cucchiaini",spicchio:"spicchi",spicchi:"spicchi",bicchiere:"bicchieri",bicchieri:"bicchieri",tazza:"tazze",tazze:"tazze",bustina:"bustine",bustine:"bustine",mazzo:"mazzo",mazzetto:"mazzo",rametto:"rametti",rametti:"rametti",pizzico:"pizzico",foglia:"foglie",foglie:"foglie",fetta:"fette",fette:"fette",noce:"noce"};
function frac(x){
  var w=Math.floor(x+1e-9),f=Math.round((x-w)*4)/4;
  if(f>=1){w+=1;f=0}
  var s={0:"",.25:"¼",.5:"½",.75:"¾"}[f];
  return (w?String(w):"")+s||"¼";
}
function fmtAmt(a,u,f){
  if(a==null)return "q.b.";
  var x=a*f;
  if(u==="g"||u==="ml"){
    if(x>=1000){var k=Math.round(x/10)/100;return String(k).replace(".",",")+(u==="g"?" kg":" l")}
    var r=x>=100?Math.round(x/5)*5:(x>=10?Math.round(x):Math.round(x*10)/10);
    return String(r).replace(".",",")+" "+u;
  }
  if(u==="l")return String(Math.round(x*100)/100).replace(".",",")+" l";
  var t=frac(x);
  var word=u?(x<=1.001&&SING[u]?SING[u]:u):"";
  return t+(word?" "+word:"");
}
function stemOf(v){var w=v.n.toLowerCase().split(/[\s(]/)[0];return w.length<=5?w:w.slice(0,w.length-1)}
var EXTRA={spaghetti:["spaghett","orecchiett","maccheron","trofie","penne","rigaton","tagliatell","bucatin","linguin","tonnarell"],zucca:["zucche"],acciughe:["acciug"],uova:["uovo","uova","tuorl","album"]};
var STEMS=V.map(function(v){return {id:v.id,k:(v.k||[stemOf(v)]).concat(EXTRA[v.id]||[])}});
function matchIng(name){
  var norm=" "+String(name).toLowerCase().split(/[^a-zàèéìòù]+/).filter(Boolean).join(" "),best=null,bl=0;
  STEMS.forEach(function(s){s.k.forEach(function(k){
    if(k.length<3||k.length<bl)return;
    var i=norm.indexOf(" "+k);if(i<0)return;
    if(k.length===3){var e=norm.indexOf(" ",i+1);var w=norm.slice(i+1,e<0?undefined:e);if(w.length>4)return}
    best=s.id;bl=k.length;
  })});
  return best;
}
function parseLine(t){
  t=String(t||"").trim().replace(/^[-•*·]\s*/,"");if(!t)return null;
  var a=null,u="",name=t,m;
  if(/^q\.?\s?b\.?(\s|$)/i.test(t)){name=t.replace(/^q\.?\s?b\.?\s*/i,"")}
  else if((m=t.match(/^(\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+|[½¼¾])\s*([A-Za-zàèéìòù]+\.?)?\s*(.*)$/))){
    var n=m[1];
    if(n==="½")a=.5;else if(n==="¼")a=.25;else if(n==="¾")a=.75;
    else if(/\//.test(n)){var p=n.split("/");a=(+p[0])/(+p[1])}else a=parseFloat(n.replace(",","."));
    var cand=(m[2]||"").toLowerCase().replace(/\.$/,""),rest=m[3];
    if(cand&&UNITS[cand]){u=UNITS[cand];name=rest}else{name=((m[2]||"")+" "+rest).trim()}
    if(u==="kg"){a*=1000;u="g"}else if(u==="dl"){a*=100;u="ml"}else if(u==="cl"){a*=10;u="ml"}
  }
  name=name.replace(/^(di|d’|d')\s*/i,"").trim();
  if(!name)return null;
  var id=matchIng(name);
  return id?[a,u,name,id]:[a,u,name];
}
function ingToText(i){
  var a=i[0],u=i[1];
  var q=a==null?"q.b.":(function(){var s=(u==="g"||u==="ml")?String(a).replace(".",","):frac(a);return s+(u?" "+(a<=1&&SING[u]?SING[u]:u):"")})();
  return q+" "+i[2];
}

/* ---------- INGREDIENTI ---------- */
function rangeText(arr){
  if(!arr)return "tutto l’anno";
  var on=[];for(var i=1;i<=12;i++)on[i]=arr.indexOf(i)>-1;
  var f=-1;for(var j=1;j<=12;j++){if(!on[j]){f=j;break}}
  if(f===-1)return "tutto l’anno";
  var runs=[],cur=null;
  for(var k=1;k<=12;k++){var m=((f-1+k)%12)+1;
    if(on[m]){if(!cur){cur={a:m,b:m};runs.push(cur)}else cur.b=m}else cur=null}
  return runs.map(function(r){return r.a===r.b?MES3L[r.a-1]:MES3L[r.a-1]+"–"+MES3L[r.b-1]}).join(", ");
}
function seasonBar(v,mo){var s='<span class="sb" aria-hidden="true">';for(var i=1;i<=12;i++){s+='<i class="'+((!v.m||v.m.indexOf(i)>-1)?"on":"")+(i===mo?" cur":"")+'"></i>'}return s+"</span>"}
function filtered(){
  var m=state.month,q=foldQ(state.q);
  return V.filter(function(v){
    if(state.seg==="stagione"&&!(v.m&&v.m.indexOf(m)>-1))return false;
    if(state.seg==="sempre"&&v.m)return false;
    if(state.cat!=="Tutti"&&v.cat!==state.cat)return false;
    if(q&&foldHay(v.n+" "+(v.k||[]).join(" ")).indexOf(q)<0)return false;
    return true;
  }).sort(function(a,b){return a.n.localeCompare(b.n,"it")});
}
function foldQ(x){var q=String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();return q.length>=5?q.replace(/[aeio]$/,""):q}
function foldHay(x){return String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function card(v,i){
  var m=state.month,tag=v.m&&v.m.indexOf(m)>-1?"Di stagione":"";
  var rot=[-5,4,-3,6,-6,3][i%6];
  return '<button class="card" data-act="ing" data-id="'+v.id+'" style="--c:'+v.bg+';--rot:'+rot+'deg">'+
    (tag?'<span class="tag">'+tag+'</span>':'')+
    '<span class="aw">'+art(v)+'</span>'+
    '<span class="nm">'+esc(v.n)+'</span>'+
    '<span class="mt">'+(v.m?"stagione "+rangeText(v.m):"tutto l’anno")+'</span>'+
    seasonBar(v,m)+'</button>';
}
function renderGrid(){
  var L=filtered();
  var label=state.seg==="stagione"?"di stagione":(state.seg==="sempre"?"sempre disponibili":"in elenco");
  $("#count").textContent=L.length+" "+(L.length===1?"ingrediente":"ingredienti")+" "+label+(state.seg==="stagione"?" · "+MESI[state.month-1].toLowerCase():"");
  $("#grid").innerHTML=L.length?L.map(card).join(""):
    '<div class="empty"><b>Niente con questi filtri</b>Prova un altro mese o togli la ricerca.<br><br><button class="btn" data-act="reset">Azzera filtri</button></div>';
}
function renderIngredienti(){
  var m=state.month;
  $("#monthName").textContent=MESI[m-1];
  var h=V.filter(function(v){return v.m&&v.m.indexOf(m)>-1});
  $("#heroSub").textContent=h.length+" ingredienti di stagione · "+RICETTE.length+" ricette in archivio";
  $("#collage").innerHTML=h.slice(0,3).map(function(v,i){return '<span class="cl cl'+i+'">'+art(v)+'</span>'}).join("");
  var strip=$("#months");
  strip.innerHTML=MES3.map(function(t,i){return '<button class="mbtn'+(i+1===NOW_M?" now":"")+'" role="tab" aria-selected="'+(i+1===m)+'" data-act="month" data-m="'+(i+1)+'">'+t+'</button>'}).join("");
  var sel=$('.mbtn[aria-selected="true"]',strip);
  if(sel)strip.scrollLeft=sel.offsetLeft-strip.clientWidth/2+sel.offsetWidth/2;
  $("#seg").innerHTML=[["stagione","Di stagione"],["sempre","Sempre"],["tutti","Tutti"]].map(function(x){return '<button data-act="seg" data-k="'+x[0]+'" aria-pressed="'+(state.seg===x[0])+'">'+x[1]+'</button>'}).join("");
  $("#cats").innerHTML=CATS.map(function(c){return '<button class="chip" data-act="cat" data-k="'+esc(c)+'" aria-pressed="'+(state.cat===c)+'">'+esc(c)+'</button>'}).join("");
  renderGrid();
}

/* ---------- RICETTARIO ---------- */
function recipesFor(){
  var q=foldQ(state.rq),L=allRecipes();
  L=L.filter(function(r){
    if(state.rseg==="regioni"&&!r.orig)return false;
    if(state.rseg==="preferite"&&!isFav(r.id))return false;
    if(state.rseg==="mie"&&!r.user)return false;
    if(state.rseg==="regioni"&&state.rreg!=="Tutte"&&r.reg!==state.rreg)return false;
    if(state.rtipo!=="Tutte"&&r.tipo!==state.rtipo)return false;
    if(q){
      var hay=foldHay(r.n+" "+(r.reg||"")+" "+r.ing.map(function(i){return i[2]}).join(" "));
      if(hay.indexOf(q)<0)return false;
    }
    return true;
  });
  return L.sort(function(a,b){return a.n.localeCompare(b.n,"it")});
}
function rcard(r){
  var im=safeImg(r.img);
  return '<button class="rcard'+(im?" photo":"")+'" data-act="rec" data-id="'+esc(r.id)+'" style="--c:'+(RC[r.reg]||"#FFD9A0")+'">'+
    (im?'<span class="ph" style="background-image:url('+im+')"></span>':'')+
    '<span class="fv" aria-hidden="true">'+(isFav(r.id)?IC.heartOn:"")+'</span>'+
    '<span class="rg">'+esc(r.reg||(r.user?"Mia ricetta":""))+(r.edited?" · modificata":"")+'</span>'+
    '<span class="nm">'+esc(r.n)+'</span>'+
    '<span class="mt"><span>'+fmtMin(r.min)+'</span><span>'+esc(r.tipo||"")+'</span></span></button>';
}
function renderRicettario(){
  $("#rseg").innerHTML=[["regioni","Regioni"],["preferite","Preferite"],["mie","Mie"]].map(function(x){return '<button data-act="rseg" data-k="'+x[0]+'" aria-pressed="'+(state.rseg===x[0])+'">'+x[1]+'</button>'}).join("");
  var regs=$("#rreg");
  if(state.rseg==="regioni"){
    var cnt={};RICETTE.forEach(function(r){cnt[r.reg]=(cnt[r.reg]||0)+1});
    regs.hidden=false;
    regs.innerHTML=['Tutte'].concat(REGIONI.map(function(r){return r.k})).map(function(k){
      var dot=k==="Tutte"?"":'<span class="dot" style="background:'+RC[k]+'"></span>';
      return '<button class="chip" data-act="rreg" data-k="'+esc(k)+'" aria-pressed="'+(state.rreg===k)+'">'+dot+esc(k)+(k==="Tutte"?"":" · "+(cnt[k]||0))+'</button>';
    }).join("");
  }else regs.hidden=true;
  $("#rtipo").innerHTML=TIPI.map(function(k){return '<button class="chip" data-act="rtipo" data-k="'+esc(k)+'" aria-pressed="'+(state.rtipo===k)+'">'+esc(k)+'</button>'}).join("");
  if($("#rq").value!==state.rq)$("#rq").value=state.rq;
  var L=recipesFor();
  $("#rcount").textContent=L.length+(L.length===1?" ricetta":" ricette");
  var html;
  if(L.length)html=L.map(rcard).join("");
  else if(state.rseg==="mie")html='<div class="empty"><b>Ancora nessuna ricetta tua</b>Tocca «Nuova ricetta» per scriverla, oppure «Scansiona un foglio» per leggerla da una foto.</div>';
  else if(state.rseg==="preferite")html='<div class="empty"><b>Nessuna preferita</b>Apri una ricetta e tocca il cuore per tenerla qui.</div>';
  else html='<div class="empty"><b>Nessuna ricetta</b>Prova a togliere i filtri o la ricerca.<br><br><button class="btn" data-act="rreset">Azzera filtri</button></div>';
  $("#rlist").innerHTML=html;
}

/* ---------- STRUMENTI ---------- */
var DENS=[["acqua",1],["latte",1.03],["farina 00",.53],["zucchero",.85],["zucchero a velo",.55],["burro",.96],["olio",.92],["riso",.85],["miele",1.4],["cacao amaro",.45]];
var VOLU=[["g","grammi",null],["ml","millilitri",1],["tazza","tazza (240 ml)",240],["cucchiaio","cucchiaio (15 ml)",15],["cucchiaino","cucchiaino (5 ml)",5]];
var TEMPI=[
 ["Uovo alla coque","3–4 min"],["Uovo barzotto","6 min"],["Uovo sodo","9–10 min"],
 ["Pasta secca","come da confezione"],["Riso per risotto","16–18 min"],["Riso basmati","10–12 min"],
 ["Patate bollite intere (medie)","25–30 min"],["Carote a rondelle","10–12 min"],["Fagiolini","8–10 min"],
 ["Cavolfiore a cimette","8–10 min"],["Lenticchie secche","25–30 min"],["Fagioli secchi (ammollati)","60–90 min"],
 ["Ceci secchi (ammollati)","90–120 min"],["Petto di pollo in padella","6–7 min per lato"],["Filetto di salmone in padella","4 + 3 min"],
 ["Pollo intero 1,5 kg in forno a 200 °C","75–90 min"]
];
var fullId=null,timers=[], tick=null, tid=1, audioCtx=null;
function pad(n){return n<10?"0"+n:""+n}
function fmtClock(s){s=Math.max(0,Math.ceil(s));var h=Math.floor(s/3600),m=Math.floor(s%3600/60);return (h?h+":":"")+pad(m)+":"+pad(s%60)}
function beep(){
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    for(var i=0;i<3;i++){
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type="sine";o.frequency.value=880;
      o.connect(g);g.connect(audioCtx.destination);var t=audioCtx.currentTime+i*0.4;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.3);
      o.start(t);o.stop(t+.32);
    }
  }catch(e){}
  try{if(navigator.vibrate)navigator.vibrate([300,150,300,150,300])}catch(e){}
}
function renderFull(){
  var el=document.getElementById("tmFull"),t=fullId&&timers.filter(function(x){return x.id===fullId})[0];
  if(!t){if(el)el.remove();fullId=null;document.body.style.overflow=state.sheet?"hidden":"";return}
  var left=(t.end-Date.now())/1000,done=left<=0,pct=Math.max(0,Math.min(100,100*(1-left/(t.total||1))));
  if(!el){el=document.createElement("div");el.id="tmFull";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");document.body.appendChild(el);document.body.style.overflow="hidden"}
  el.className="tmfull"+(done?" done":"");
  el.innerHTML='<div class="tmf-top"><button class="iconbtn" data-act="tmin" aria-label="Riduci a icona">'+IC.back+'</button><span>'+esc(t.label)+'</span><span></span></div>'+
    '<div class="tmf-mid"><b>'+(done?"Pronto!":fmtClock(left))+'</b><div class="tmf-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></div></div>'+
    '<div class="tmf-btns">'+(done?'<button class="btn pri" data-act="tstop" data-id="'+t.id+'">Chiudi</button>':'<button class="btn" data-act="tplus" data-id="'+t.id+'">+1 min</button><button class="btn danger" data-act="tstop" data-id="'+t.id+'">Ferma</button>')+'</div>';
}
function renderTimers(){
  renderFull();
  var el=$("#timers");if(!el)return;
  var now=Date.now();
  el.innerHTML=timers.length?timers.map(function(t){
    var left=(t.end-now)/1000;
    return '<div class="timer'+(left<=0?" done":"")+'" data-act="tfull" data-id="'+t.id+'"><div><small>'+esc(t.label)+'</small><b>'+(left<=0?"Pronto!":fmtClock(left))+'</b></div><span></span><button data-act="tdel" data-id="'+t.id+'" aria-label="Elimina timer">'+IC.x+'</button></div>';
  }).join(""):'<p class="note" style="margin:0">Nessun timer attivo.</p>';
}
function ensureTick(){
  if(tick)return;
  tick=setInterval(function(){
    var now=Date.now(),fired=false;
    timers.forEach(function(t){if(!t.done&&t.end<=now){t.done=true;fired=true;fullId=t.id;toast("Timer «"+t.label+"» finito")}});
    if(fired)beep();
    renderTimers();
    if(!timers.length){clearInterval(tick);tick=null}
  },500);
}
function addTimer(min,label){
  min=+min;if(!(min>0)){toast("Scrivi quanti minuti");return}
  var nt={id:tid++,label:label||(min+" min"),end:Date.now()+min*60000,total:min*60,done:false};
  timers.push(nt);fullId=nt.id;
  ensureTick();renderTimers();
}
function toolsHTML(){
  return '<section class="tool bigtimer"><h3>Timer</h3><p class="sub">Più timer insieme. Tieni l’app aperta: quando finisce suona e vibra.</p>'+
    '<div class="two"><label class="fld"><span>Minuti</span><input id="tmM" type="number" inputmode="decimal" min="0" step="any" placeholder="10"></label>'+
    '<label class="fld"><span>Nome</span><input id="tmL" type="text" placeholder="Pasta" maxlength="24"></label></div>'+
    '<div class="preset"><button class="chip" data-act="tpreset" data-m="3">3 min</button><button class="chip" data-act="tpreset" data-m="5">5 min</button><button class="chip" data-act="tpreset" data-m="10">10 min</button><button class="chip" data-act="tpreset" data-m="15">15 min</button><button class="chip" data-act="tpreset" data-m="30">30 min</button></div>'+
    '<div style="margin-top:12px"><button class="btn pri" data-act="tadd" style="width:100%">Avvia</button></div><div class="timers" id="timers"></div></section>'+
  '<section class="tool"><h3>Cosa posso cucinare</h3><p class="sub">Scrivi gli ingredienti che hai in casa: ti mostro le ricette che puoi fare, o quasi. Sale, olio e pepe li do per scontati.</p>'+
    '<label class="search"><input id="ckQ" type="search" placeholder="Es. patate, uova, zucchine…" autocomplete="off" aria-label="Cerca un ingrediente che hai"></label>'+
    '<div class="preset" id="ckSug"></div><div class="preset" id="ckSel"></div><div id="ckRes"></div></section>'+
  prodApi.html()+
  '<section class="tool"><h3>I tuoi dati</h3><p class="sub">Preferite, ricette tue, modifiche e menu restano solo su questo telefono. Salva un file di backup per non perderli (cambio telefono, reinstallazione) e ricaricalo quando serve.</p>'+
    '<div class="actions"><button class="btn pri" data-act="export">Salva backup</button><button class="btn" data-act="import">Carica backup</button></div>'+
    '<input id="fileImp" type="file" accept=".json,application/json" hidden></section>';
}
function backupData(){return JSON.stringify({app:"cucinamia",v:1,date:new Date().toISOString(),fav:DB.fav,mine:DB.mine,over:DB.over,menus:DB.menus})}
async function exportBackup(){
  var txt=backupData(),name="cucina-mia-backup-"+new Date().toISOString().slice(0,10)+".json";
  try{
    if(Capacitor.isNativePlatform()){
      var w=await Filesystem.writeFile({path:name,data:txt,directory:Directory.Cache,encoding:Encoding.UTF8});
      await Share.share({title:"Backup Cucina Mia",url:w.uri,dialogTitle:"Salva il backup"});
    }else{
      var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();a.remove();toast("Backup salvato");
    }
  }catch(e){if(!/cancel|dismiss/i.test(String(e&&e.message||e)))toast("Non sono riuscito a salvare il backup")}
}
function importBackup(f){
  var rd=new FileReader();
  rd.onerror=function(){toast("Non riesco a leggere il file")};
  rd.onload=function(){
    var d;try{d=JSON.parse(rd.result)}catch(e){toast("File non valido");return}
    if(!d||d.app!=="cucinamia"){toast("Questo non è un backup di Cucina Mia");return}
    if(!confirm("Caricare il backup? I dati si uniscono a quelli già presenti: le ricette e i menu con lo stesso codice vengono sostituiti."))return;
    var n=0;
    (Array.isArray(d.fav)?d.fav:[]).forEach(function(x){if(typeof x==="string"&&DB.fav.indexOf(x)<0){DB.fav.push(x);n++}});
    (Array.isArray(d.mine)?d.mine:[]).forEach(function(r){if(!r||typeof r.id!=="string"||!Array.isArray(r.ing))return;DB.mine=DB.mine.filter(function(x){return x.id!==r.id});DB.mine.push(r);n++});
    if(d.over&&typeof d.over==="object")Object.keys(d.over).forEach(function(k){DB.over[k]=d.over[k];n++});
    (Array.isArray(d.menus)?d.menus:[]).forEach(function(m){if(!m||typeof m.id!=="string"||!Array.isArray(m.rec))return;DB.menus=DB.menus.filter(function(x){return x.id!==m.id});DB.menus.push({id:m.id,n:String(m.n||"Menu"),pers:+m.pers||4,rec:m.rec,done:m.done&&typeof m.done==="object"?m.done:{}});n++});
    saveDB();toast("Backup caricato");route();
  };
  rd.readAsText(f);
}
function convCalc(){
  var q=parseFloat($("#cvQ").value),vu=VOLU[+$("#cvU").value],d=DENS[+$("#cvI").value][1];
  var out=$("#cvOut");
  if(!(q>=0)){out.innerHTML="";return}
  var ml=vu[2]==null?q/d:q*vu[2], g=ml*d;
  function f(x){return (x>=100?Math.round(x):Math.round(x*10)/10).toString().replace(".",",")}
  function t(x){return (Math.round(x*4)/4).toString().replace(".",",")}
  out.innerHTML='<div><b>'+f(g)+' g</b><small>grammi</small></div><div><b>'+f(ml)+' ml</b><small>millilitri</small></div>'+
    '<div><b>'+t(ml/240)+'</b><small>tazze (240 ml)</small></div><div><b>'+t(ml/15)+'</b><small>cucchiai (15 ml)</small></div>';
}
function tempCalc(){var c=parseFloat($("#cvC").value);$("#cvF").textContent=isNaN(c)?"—":Math.round(c*9/5+32)+" °F"}
/* ---------- cosa posso cucinare ---------- */
var cookSel=[],COOK_SKIP={sale:1,olio:1,pepe:1};
function foldTxt(x){return String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function renderCookSug(){
  var el=$("#ckSug"),inp=$("#ckQ");if(!el||!inp)return;
  var q=foldTxt(inp.value.trim());
  if(!q){el.innerHTML="";return}
  if(q.length>=5)q=q.replace(/[aeio]$/,"");
  var L=V.filter(function(v){return cookSel.indexOf(v.id)<0&&(foldTxt(v.n).indexOf(q)>-1||(v.k||[]).some(function(k){return foldTxt(k).indexOf(q)>-1}))}).slice(0,8);
  el.innerHTML=L.length?L.map(function(v){return '<button class="chip" data-act="ckadd" data-id="'+v.id+'">+ '+esc(v.n)+'</button>'}).join(""):'<p class="note" style="margin:0">Nessun ingrediente trovato.</p>';
}
function renderCook(){
  var sel=$("#ckSel"),res=$("#ckRes");if(!sel||!res)return;
  sel.innerHTML=cookSel.map(function(id){var v=BY[id];return v?'<button class="chip on" data-act="ckdel" data-id="'+id+'" aria-label="Togli '+esc(v.n)+'">'+esc(v.n)+' ✕</button>':''}).join("")+(cookSel.length>1?'<button class="chip" data-act="ckclear">Svuota</button>':'');
  if(!cookSel.length){res.innerHTML="";return}
  var out=[];
  allRecipes().forEach(function(r){
    var ids=[];r.ing.forEach(function(i){if(i[3]&&!COOK_SKIP[i[3]]&&ids.indexOf(i[3])<0)ids.push(i[3])});
    if(!ids.length)return;
    var have=ids.filter(function(id){return cookSel.indexOf(id)>-1}),miss=ids.filter(function(id){return cookSel.indexOf(id)<0});
    if(!have.length)return;
    out.push({r:r,have:have.length,miss:miss,tot:ids.length});
  });
  out.sort(function(a,b){return a.miss.length-b.miss.length||b.have-a.have||a.r.n.localeCompare(b.r.n,"it")});
  var good=out.filter(function(o){return o.miss.length<=3&&o.have>=Math.min(2,cookSel.length)}).slice(0,30);
  if(!good.length)good=out.slice(0,15);
  res.innerHTML=good.length?'<p class="lbl" style="margin-top:14px">'+good.length+(good.length===1?" ricetta":" ricette")+'</p>'+good.map(function(o){
    var r=o.r,m=o.miss.length?"Mancano: "+o.miss.slice(0,4).map(function(id){return BY[id]?BY[id].n.toLowerCase():id}).join(", ")+(o.miss.length>4?"…":""):"Hai tutto!";
    return '<button class="rrow" data-act="rec" data-id="'+esc(r.id)+'" style="--c:'+(RC[r.reg]||"#FFD9A0")+';margin-bottom:8px"><span><b>'+esc(r.n)+'</b><small>'+esc(m)+'</small></span>'+IC.next+'</button>';
  }).join(""):'<p class="note" style="margin:12px 0 0">Nessuna ricetta usa questi ingredienti. Prova ad aggiungerne altri.</p>';
}
function renderStrumenti(){
  var root=$("#tools");
  if(!root.firstChild){root.innerHTML=toolsHTML()}
  renderCook();
  renderTimers();
}

/* ---------- SCHEDE ---------- */
function meter(n,color){var s='<span class="meter" style="--mc:'+color+'" aria-hidden="true">';for(var i=1;i<=3;i++)s+='<i class="'+(i<=n?"on":"")+'"></i>';return s+"</span>"}
function recipesWith(id){return allRecipes().filter(function(r){return r.ing.some(function(i){return i[3]===id})}).sort(function(a,b){return a.n.localeCompare(b.n,"it")})}
function sheetIng(v){
  var m=state.month;
  var cal=v.m?'<div class="cal" role="img" aria-label="Stagione: '+rangeText(v.m)+'"><div class="cal-r cal-h"><span class="lab"></span>'+LET.map(function(l,i){return '<b class="'+(i+1===m?"cur":"")+'">'+l+'</b>'}).join("")+'</div><div class="cal-r"><span class="lab">Stagione</span>'+MES3.map(function(_,i){return '<i class="k-m'+(v.m.indexOf(i+1)>-1?" on":"")+(i+1===m?" cur":"")+'"></i>'}).join("")+'</div></div>':'<p class="note" style="margin:0">Si trova tutto l’anno.</p>';
  var pills=function(a){return a.map(function(x){return '<span class="pill ok">'+esc(x)+'</span>'}).join("")};
  var rs=recipesWith(v.id);
  var rl=rs.length?rs.map(function(r){return '<button class="rrow" data-act="rec" data-id="'+esc(r.id)+'" data-push="1" style="--c:'+(RC[r.reg]||"#FFD9A0")+'"><span><b>'+esc(r.n)+'</b><small>'+esc(r.reg||"Mia ricetta")+' · '+fmtMin(r.min)+'</small></span>'+IC.next+'</button>'}).join(""):'<p class="note" style="margin:0">Ancora nessuna ricetta con questo ingrediente. Aggiungine una tua dal ricettario.</p>';
  return '<div class="sh-head" style="--c:'+v.bg+'">'+headBtns()+'<h2>'+esc(v.n)+'</h2>'+
   '<div class="sh-pills"><span class="pill">'+esc(v.cat)+'</span>'+(v.kcal?'<span class="pill">'+v.kcal+' kcal / 100 g</span>':'')+'</div>'+
   '<div class="sh-art">'+art(v)+'</div></div>'+
   '<div class="sh-body">'+
    '<div><p class="lbl">Stagione</p>'+cal+'</div>'+
    '<div><p class="lbl">Ricette con '+esc(v.n.toLowerCase())+'</p>'+rl+'</div>'+
    '<div><p class="lbl">Come si conserva</p><p class="cons">'+esc(v.cons)+'</p></div>'+
    '<div><p class="lbl">Si abbina con</p><div class="ing-link">'+pills(v.abb)+'</div></div>'+
    (v.sost&&v.sost.length?'<div><p class="lbl">Se non ce l’hai</p><div class="ing-link">'+v.sost.map(function(x){return '<span class="pill">'+esc(x)+'</span>'}).join("")+'</div></div>':'')+
    '<div class="tip"><p class="lbl">Il consiglio</p><p>'+esc(v.tip)+'</p></div>'+
   '</div>'+
   '<div class="sh-cta"><button class="btn pri" data-act="seerec" data-id="'+v.id+'">Vedi nel ricettario</button><button class="btn" data-act="close">Chiudi</button></div>';
}
function headBtns(){
  return (state.stack.length?'<button class="sh-close" style="right:auto;left:12px" data-act="back" aria-label="Indietro">'+IC.back+'</button>':'')+'<button class="sh-close" data-act="close" aria-label="Chiudi">'+IC.x+'</button>';
}
var recPers=null;
/* ---------- condivisione ---------- */
var SHARE_URL="https://mirkoori.github.io/Cucina-Mia/";
var APP_URL="https://github.com/Mirkoori/Cucina-Mia/releases/latest";
var sharedTmp=null,shareMode=false;
function b64enc(str){var b=new TextEncoder().encode(str),s="";for(var i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function b64dec(t){t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";var s=atob(t),b=new Uint8Array(s.length);for(var i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return new TextDecoder().decode(b)}
function shareLink(r){
  if(r.orig&&!r.edited&&!r.user)return SHARE_URL+"?r="+encodeURIComponent(r.id);
  var o={n:r.n,reg:r.reg||"",tipo:r.tipo||"",min:r.min,pers:r.pers,dif:r.dif,ing:(r.ing||[]).map(function(i){return [i[0],i[1],i[2]]}),steps:r.steps||[],note:r.note||"",storia:r.storia||""};
  return SHARE_URL+"?c="+b64enc(JSON.stringify(o));
}
function shareText(r){
  var f=recPers/(r.pers||4);
  var t=r.n+"\n"+(r.reg?r.reg+" · ":"")+fmtMin(r.min)+" · "+recPers+(recPers===1?" persona":" persone")+"\n\nIngredienti\n";
  t+=r.ing.map(function(i){return "- "+fmtAmt(i[0],i[1],f)+" "+i[2]}).join("\n");
  t+="\n\nPreparazione\n"+r.steps.map(function(x,k){return (k+1)+". "+x}).join("\n");
  t+="\n\nVedi la ricetta e scopri l'app Cucina Mia: "+shareLink(r);
  return t;
}
async function shareRecipe(r){
  var text=shareText(r);
  try{await Share.share({title:r.n,text:text,url:shareLink(r),dialogTitle:"Condividi la ricetta"});return}catch(e){if(e&&/cancel/i.test(String(e.message||e)))return}
  try{await navigator.clipboard.writeText(text);toast("Ricetta copiata: incollala dove vuoi")}catch(e2){toast("Non riesco a condividere da qui")}
}
function parseShared(){
  try{
    var q=new URLSearchParams(location.search),id=q.get("r"),c=q.get("c");
    if(id&&RICETTE.some(function(x){return x.id===id}))return {t:"base",id:id};
    if(c){var o=JSON.parse(b64dec(c));if(o&&typeof o.n==="string"&&Array.isArray(o.ing)&&Array.isArray(o.steps)){
      return {t:"custom",rec:{id:"shared-tmp",n:o.n.slice(0,120),reg:String(o.reg||""),tipo:String(o.tipo||"Primi"),min:+o.min||30,pers:+o.pers||4,dif:+o.dif||1,
        ing:o.ing.slice(0,80).map(function(i){return [i[0]==null?null:+i[0]||null,String(i[1]||""),String(i[2]||"").slice(0,120)]}),
        steps:o.steps.slice(0,60).map(function(x){return String(x).slice(0,1500)}),note:String(o.note||"").slice(0,1500),storia:String(o.storia||"").slice(0,1500),shared:true}}}
  }}catch(e){}
  return null;
}
function sharedBanner(){
  return '<div class="tip sharedbox"><p class="lbl">Ricetta condivisa con Cucina Mia</p><p>Un amico ti ha mandato questa ricetta. Con l’app trovi centinaia di ricette italiane, schede degli ingredienti, un menu con la lista della spesa, e puoi salvare le tue.</p><a class="btn pri" href="'+APP_URL+'" target="_blank" rel="noopener">Scarica l’app</a></div>';
}
function sheetRec(r){
  var f=recPers/(r.pers||4);
  var im=safeImg(r.img);
  var ing=r.ing.map(function(i){
    var lk=i[3]&&BY[i[3]]?'<button class="lk" data-act="ing" data-id="'+i[3]+'" data-push="1">scheda</button>':"";
    return '<li><b>'+fmtAmt(i[0],i[1],f)+'</b><span>'+esc(i[2])+'</span>'+lk+'</li>';
  }).join("");
  var steps=r.steps.map(function(s){return '<li><span>'+esc(s)+'</span></li>'}).join("");
  var fav=isFav(r.id);
  var third=r.user?'<button class="btn danger" data-act="del" data-id="'+esc(r.id)+'">Elimina</button>':(r.edited?'<button class="btn" data-act="restore" data-id="'+esc(r.id)+'">Originale</button>':"");
  return '<div class="sh-head short'+(state.stack.length?" hasback":"")+'" style="--c:'+(RC[r.reg]||"#FFD9A0")+'">'+headBtns()+'<h2>'+esc(r.n)+'</h2>'+
   '<div class="sh-pills row">'+(r.reg?'<span class="pill">'+esc(r.reg)+'</span>':'')+(r.tipo?'<span class="pill">'+esc(r.tipo)+'</span>':'')+'<span class="pill">'+fmtMin(r.min)+(r.riposo?" + "+esc(r.riposo):"")+'</span>'+(r.dif?'<span class="pill">'+DIF[r.dif-1]+'</span>':'')+(r.edited?'<span class="pill">modificata</span>':'')+'</div></div>'+
   '<div class="sh-body">'+
    (im?'<img class="photo-full" src="'+im+'" alt="Foto della ricetta">':'')+
    '<div><p class="lbl">Per quante persone</p><div class="stepper"><button data-act="pers" data-d="-1" aria-label="Meno persone">'+IC.minus+'</button><output aria-live="polite">'+recPers+(recPers===1?" persona":" persone")+'</output><button data-act="pers" data-d="1" aria-label="Più persone">'+IC.plus+'</button></div></div>'+
    '<div><p class="lbl">Ingredienti</p><ul class="ings">'+ing+'</ul></div>'+
    '<div><p class="lbl">Preparazione</p><ol class="steps">'+steps+'</ol></div>'+
    (r.storia?'<div class="tip storia"><p class="lbl">Un po’ di storia</p><p>'+esc(r.storia)+'</p></div>':'')+
    (r.note?'<div class="tip"><p class="lbl">Da sapere</p><p>'+esc(r.note)+'</p></div>':'')+
    (r.shared?'':'<button class="btn pri" data-act="addmenu" data-id="'+esc(r.id)+'">Aggiungi a un menu</button><button class="btn" data-act="share" data-id="'+esc(r.id)+'">Condividi la ricetta</button>')+
    (shareMode?sharedBanner():'')+
   '</div>'+
   (r.shared?'<div class="sh-cta"><button class="btn pri" data-act="saveshared">Salva nel mio ricettario</button><button class="btn" data-act="closeshared">Chiudi</button></div>':'<div class="sh-cta'+(third?" three":"")+'"><button class="btn pri" data-act="fav" data-id="'+esc(r.id)+'" aria-pressed="'+fav+'">'+(fav?IC.heartOn+"Preferita":IC.heart+"Preferita")+'</button><button class="btn" data-act="edit" data-id="'+esc(r.id)+'">Modifica</button>'+third+'</div>');
}
function sheetAddMenu(r){
  var rows=DB.menus.map(function(m){
    var on=m.rec.indexOf(r.id)>-1;
    return '<button class="mrow'+(on?" on":"")+'" data-act="addm" data-mid="'+esc(m.id)+'" data-id="'+esc(r.id)+'" aria-pressed="'+on+'"><span style="display:grid;gap:2px;flex:1;min-width:0"><b>'+esc(m.n)+'</b><small>'+m.rec.length+(m.rec.length===1?" ricetta":" ricette")+(on?" · già dentro":"")+'</small></span><span aria-hidden="true">'+(on?"✓":"+")+'</span></button>';
  }).join("");
  return '<div class="sh-head short hasback" style="--c:#FFD9A0">'+headBtns()+'<h2>Aggiungi a un menu</h2><div class="sh-pills row"><span class="pill">'+esc(r.n)+'</span></div></div>'+
   '<div class="sh-body">'+(rows?'<div><p class="lbl">I tuoi menu (tocca per aggiungere o togliere)</p><div class="rlist">'+rows+'</div></div>':'<p>Non hai ancora nessun menu: creane uno qui sotto.</p>')+
   '<div><p class="lbl">Nuovo menu</p><label class="search"><input id="newMenuName" type="text" maxlength="60" placeholder="Es. Cena di Natale" autocomplete="off" aria-label="Nome del nuovo menu"></label></div>'+
   '<button class="btn pri" data-act="addnew" data-id="'+esc(r.id)+'">Crea menu e aggiungi</button></div>';
}
function showSheet(html){
  $("#sheetRoot").innerHTML='<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true">'+html+'</div></div>';
  document.body.style.overflow="hidden";
  var s=$(".sheet");if(s)s.scrollTop=0;
}
function renderSheet(){
  var s=state.sheet;if(!s){hideSheet();return}
  if(s.t==="ing"){var v=BY[s.id];if(!v){hideSheet();return}showSheet(sheetIng(v))}
  else if(s.t==="addmenu"){var ar=getRecipe(s.id);if(!ar){hideSheet();return}showSheet(sheetAddMenu(ar))}
  else if(s.t==="rec"){var r=getRecipe(s.id);if(!r){hideSheet();return}if(recPers==null||s.fresh){recPers=r.pers||4;s.fresh=false}showSheet(sheetRec(r))}
  else if(s.t==="edit"){showSheet(sheetEdit())}
}
function openSheet(t,id,push){
  if(!state.sheet)lastFocus=document.activeElement;
  if(push&&state.sheet&&state.sheet.t!=="edit")state.stack.push(state.sheet);else if(!push)state.stack=[];
  state.sheet={t:t,id:id,fresh:true};
  renderSheet();
  var c=$(".sh-close:last-of-type");if(c)c.focus();
}
function hideSheet(){
  state.sheet=null;state.stack=[];state.edit=null;recPers=null;shareMode=false;sharedTmp=null;
  $("#sheetRoot").innerHTML="";document.body.style.overflow="";
  if(lastFocus&&document.contains(lastFocus)&&lastFocus.focus)lastFocus.focus();
}
function backSheet(){
  var p=state.stack.pop();
  if(!p){hideSheet();return}
  state.sheet=p;state.sheet.fresh=false;renderSheet();
}

/* ---------- EDITOR RICETTE ---------- */
function newDraft(r){
  r=r||{};
  return {id:r.id||null,orig:!!r.orig,n:r.n||"",reg:r.reg||"",tipo:r.tipo||"Primi",pers:r.pers||4,min:r.min||30,dif:r.dif||1,riposo:r.riposo||"",
    ingTxt:(r.ing||[]).map(ingToText).join("\n"),stepsTxt:(r.steps||[]).join("\n"),note:r.note||"",img:safeImg(r.img)||"",
    ingKeep:(r.ing||[])};
}
function sheetEdit(){
  var d=state.edit.draft;
  var regOpts='<option value="">Nessuna</option>'+REGIONI.map(function(r){return '<option'+(d.reg===r.k?" selected":"")+'>'+esc(r.k)+'</option>'}).join("");
  var tipoOpts=TIPI.slice(1).map(function(t){return '<option'+(d.tipo===t?" selected":"")+'>'+esc(t)+'</option>'}).join("");
  var difOpts=DIF.map(function(t,i){return '<option value="'+(i+1)+'"'+(+d.dif===i+1?" selected":"")+'>'+t+'</option>'}).join("");
  return '<div class="sh-head short" style="--c:var(--accent)"><button class="sh-close" data-act="close" aria-label="Chiudi senza salvare">'+IC.x+'</button><h2>'+(d.id?"Modifica ricetta":"Nuova ricetta")+'</h2></div>'+
  '<div class="sh-body"><div class="scanbox"><p><b>Hai un foglio con la ricetta?</b> Fotografalo: leggo il testo e lo metto qui sotto. Va benissimo per testo stampato o in stampatello; la scrittura a mano in corsivo viene letta male, quindi controlla e correggi.</p>'+
   '<div class="row"><button class="btn pri" data-act="pickcam">Scatta una foto</button><button class="btn" data-act="pickgal">Scegli dalla galleria</button></div>'+
   '<div class="prog" id="scProg" hidden><i id="scBar"></i></div><p id="scMsg" role="status" aria-live="polite"></p></div>'+
   '<input id="fileCam" type="file" accept="image/*" capture="environment"><input id="fileGal" type="file" accept="image/*">'+
   '<div class="form">'+
    '<label class="fld"><span>Nome della ricetta</span><input data-f="n" type="text" maxlength="80" value="'+esc(d.n)+'" placeholder="Per esempio: Torta della nonna"></label>'+
    '<div class="two"><label class="fld"><span>Regione</span><select data-f="reg">'+regOpts+'</select></label><label class="fld"><span>Tipo di piatto</span><select data-f="tipo">'+tipoOpts+'</select></label></div>'+
    '<div class="two"><label class="fld"><span>Persone</span><input data-f="pers" type="number" inputmode="numeric" min="1" max="50" value="'+esc(d.pers)+'"></label><label class="fld"><span>Minuti</span><input data-f="min" type="number" inputmode="numeric" min="1" max="1440" value="'+esc(d.min)+'"></label></div>'+
    '<label class="fld"><span>Difficoltà</span><select data-f="dif">'+difOpts+'</select></label>'+
    '<label class="fld"><span>Ingredienti (uno per riga)</span><textarea id="edIng" data-f="ingTxt" placeholder="300 g farina&#10;2 uova&#10;q.b. sale">'+esc(d.ingTxt)+'</textarea><small>Scrivi prima la quantità, poi l’unità, poi l’ingrediente. Se scrivi «uova», «burro»… la ricetta compare anche nella scheda di quell’ingrediente.</small></label>'+
    '<label class="fld"><span>Preparazione (un passaggio per riga)</span><textarea id="edSteps" data-f="stepsTxt" placeholder="Mescola la farina con lo zucchero&#10;Cuoci a 180 °C per 40 minuti">'+esc(d.stepsTxt)+'</textarea></label>'+
    '<label class="fld"><span>Note (facoltative)</span><textarea data-f="note" style="min-height:70px">'+esc(d.note)+'</textarea></label>'+
    '<div class="fld"><span>Foto</span>'+(d.img?'<img class="thumb" src="'+d.img+'" alt="Foto allegata"><div class="row" style="margin-top:8px;display:flex;gap:8px"><button class="btn" data-act="rmimg">Togli la foto</button></div>':'<small>Nessuna foto. Se scansioni un foglio, la foto resta allegata alla ricetta, così hai sempre l’originale.</small>')+'</div>'+
   '</div></div>'+
   '<div class="sh-cta"><button class="btn pri" data-act="save">Salva ricetta</button><button class="btn" data-act="close">Annulla</button></div>';
}
function openEditor(r,scan){
  lastFocus=document.activeElement;
  state.stack=[];
  state.edit={draft:newDraft(r)};
  state.sheet={t:"edit"};
  renderSheet();
  if(scan){var f=$("#fileCam");if(f)f.click()}
}
function collectDraft(){
  var d=state.edit.draft;
  document.querySelectorAll("#sheetRoot [data-f]").forEach(function(el){d[el.dataset.f]=el.value});
  return d;
}
function saveDraft(){
  var d=collectDraft(),name=d.n.trim();
  if(!name){toast("Scrivi il nome della ricetta");return}
  var ing=d.ingTxt.split("\n").map(parseLine).filter(Boolean);
  var steps=d.stepsTxt.split("\n").map(function(s){return s.trim().replace(/^(\d+[.)]|[-•*·])\s*/,"")}).filter(Boolean);
  if(!ing.length&&!steps.length){toast("Aggiungi almeno un ingrediente o un passaggio");return}
  var rec={id:d.id||("u-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)),n:name,reg:d.reg||"",tipo:d.tipo,min:Math.max(1,+d.min||30),pers:Math.max(1,+d.pers||4),dif:+d.dif||1,riposo:d.riposo||"",ing:ing,steps:steps,note:d.note.trim(),img:d.img||""};
  if(d.orig){DB.over[rec.id]=rec}
  else{
    var i=DB.mine.findIndex(function(x){return x.id===rec.id});
    if(i>-1)DB.mine[i]=rec;else DB.mine.push(rec);
  }
  saveDB();
  toast("Ricetta salvata");
  state.edit=null;
  state.stack=[];
  state.sheet={t:"rec",id:rec.id,fresh:true};
  renderSheet();
  if(currentView()==="ricettario")renderRicettario();
}
function loadImageEl(file){
  return new Promise(function(res,rej){
    var url=URL.createObjectURL(file),im=new Image();
    im.onload=function(){res({im:im,url:url})};im.onerror=function(){URL.revokeObjectURL(url);rej(new Error("img"))};im.src=url;
  });
}
function drawScaled(im,maxSide,gray){
  var w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,maxSide/Math.max(w,h));
  var c=document.createElement("canvas");c.width=Math.round(w*k);c.height=Math.round(h*k);
  var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  if(gray)x.filter="grayscale(1) contrast(1.35)";
  x.drawImage(im,0,0,c.width,c.height);return c;
}
async function scanFile(file){
  if(!file)return;
  var prog=$("#scProg"),bar=$("#scBar"),msg=$("#scMsg");
  prog.hidden=false;bar.style.width="3%";msg.textContent="Preparo la foto…";
  try{
    var L=await loadImageEl(file);
    var forOcr=drawScaled(L.im,1800,true);
    var thumb=drawScaled(L.im,900,false).toDataURL("image/jpeg",.65);
    URL.revokeObjectURL(L.url);
    var blob=await new Promise(function(r){forOcr.toBlob(r,"image/png")});
    msg.textContent="Leggo il testo… la prima volta può richiedere qualche secondo.";
    var txt=await leggiFoto(blob,function(p){bar.style.width=Math.max(5,Math.round(p*100))+"%"});
    var res=dividiTesto(txt);
    var d=collectDraft();
    if(!res.ing.length&&!res.steps.length&&!res.titolo){msg.textContent="Non sono riuscito a leggere niente. Prova con più luce, il foglio dritto e la scrittura in stampatello.";prog.hidden=true;if(!d.img){d.img=thumb;state.edit.draft=d;renderSheet()}return}
    if(!d.n.trim()&&res.titolo)d.n=res.titolo;
    if(res.ing.length)d.ingTxt=(d.ingTxt.trim()?d.ingTxt.trim()+"\n":"")+res.ing.join("\n");
    if(res.steps.length)d.stepsTxt=(d.stepsTxt.trim()?d.stepsTxt.trim()+"\n":"")+res.steps.join("\n");
    d.img=thumb;
    state.edit.draft=d;
    renderSheet();
    var m2=$("#scMsg");if(m2)m2.textContent="Fatto. Controlla bene ingredienti e passaggi: il testo letto da una foto può avere errori.";
    var sh=$(".sheet");if(sh){var t=$("#edIng");if(t)sh.scrollTop=Math.max(0,t.getBoundingClientRect().top-sh.getBoundingClientRect().top+sh.scrollTop-80)}
  }catch(e){
    msg.textContent="Non riesco a leggere questa foto. Riprova, oppure scrivi la ricetta a mano.";prog.hidden=true;
  }
}

/* ---------- navigazione ---------- */
var VIEWS=["ingredienti","ricettario","menu","strumenti"];
var menuApi=null;
function currentView(){var h=location.hash.slice(1);return VIEWS.indexOf(h)<0?"ingredienti":h}
function route(){
  var h=currentView();
  VIEWS.forEach(function(k){$("#v-"+k).hidden=k!==h});
  document.querySelectorAll(".tab").forEach(function(a){if(a.dataset.tab===h)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  if(h==="ingredienti")renderIngredienti();
  if(h==="ricettario")renderRicettario();
  if(h==="menu"&&menuApi)menuApi.render();
  if(h==="strumenti")renderStrumenti();
  window.scrollTo(0,0);
}

/* ---------- eventi ---------- */
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-act]");if(!t)return;
  var a=t.dataset.act,id=t.dataset.id;
  if(a==="scrim"){if(e.target===t&&!(state.sheet&&state.sheet.t==="edit"))hideSheet();return}
  if(a==="ing"){openSheet("ing",id,!!t.dataset.push)}
  else if(a==="rec"){openSheet("rec",id,!!t.dataset.push)}
  else if(a==="close"){hideSheet()}
  else if(a==="back"){backSheet()}
  else if(a==="month"){state.month=+t.dataset.m;renderIngredienti()}
  else if(a==="seg"){state.seg=t.dataset.k;renderIngredienti()}
  else if(a==="cat"){state.cat=t.dataset.k;if(state.cat!=="Tutti"&&state.cat!=="Verdure"&&state.cat!=="Frutta"&&state.seg==="stagione")state.seg="tutti";renderIngredienti()}
  else if(a==="reset"){state.seg="tutti";state.cat="Tutti";state.q="";$("#q").value="";renderIngredienti()}
  else if(a==="rseg"){state.rseg=t.dataset.k;renderRicettario()}
  else if(a==="rreg"){state.rreg=t.dataset.k;renderRicettario()}
  else if(a==="rtipo"){state.rtipo=t.dataset.k;renderRicettario()}
  else if(a==="rreset"){state.rreg="Tutte";state.rtipo="Tutte";state.rq="";renderRicettario()}
  else if(a==="seerec"){var v=BY[id];hideSheet();state.rseg="regioni";state.rreg="Tutte";state.rtipo="Tutte";state.rq=v?v.n:"";if(location.hash==="#ricettario")renderRicettario();else location.hash="#ricettario"}
  else if(a==="pers"){recPers=Math.max(1,Math.min(50,recPers+(+t.dataset.d)));var r=getRecipe(state.sheet.id);if(r){var sc=$(".sheet").scrollTop;showSheet(sheetRec(r));$(".sheet").scrollTop=sc}}
  else if(a==="fav"){
    var i=DB.fav.indexOf(id);if(i>-1){DB.fav.splice(i,1);toast("Tolta dalle preferite")}else{DB.fav.push(id);toast("Aggiunta alle preferite")}
    saveDB();t.setAttribute("aria-pressed",String(i<0));t.innerHTML=(i<0?IC.heartOn:IC.heart)+"Preferita";
    if(currentView()==="ricettario")renderRicettario();
  }
  else if(a==="ckadd"){if(cookSel.indexOf(id)<0)cookSel.push(id);var ci=$("#ckQ");if(ci){ci.value="";ci.focus()}renderCookSug();renderCook()}
  else if(a==="ckdel"){cookSel=cookSel.filter(function(x){return x!==id});renderCookSug();renderCook()}
  else if(a==="ckclear"){cookSel=[];renderCook()}
  else if(a==="addmenu"){openSheet("addmenu",id,true)}
  else if(a==="addm"){var am=DB.menus.filter(function(x){return x.id===t.dataset.mid})[0];if(am){var ai=am.rec.indexOf(id);if(ai>-1){am.rec.splice(ai,1);toast("Tolta da «"+am.n+"»")}else{am.rec.push(id);toast("Aggiunta a «"+am.n+"»")}saveDB();var asc=$(".sheet").scrollTop;showSheet(sheetAddMenu(getRecipe(id)));$(".sheet").scrollTop=asc}}
  else if(a==="addnew"){var inp=$("#newMenuName"),nn=inp?inp.value.trim():"";if(!nn){toast("Scrivi un nome per il menu");if(inp)inp.focus()}else{DB.menus.unshift({id:"m"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),n:nn,pers:4,rec:[id],done:{}});saveDB();toast("Menu «"+nn+"» creato");showSheet(sheetAddMenu(getRecipe(id)))}}
  else if(a==="share"){var sr=getRecipe(id);if(sr)shareRecipe(sr)}
  else if(a==="saveshared"){if(sharedTmp){var nr=Object.assign({},sharedTmp,{id:"u-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)});delete nr.shared;DB.mine.push(nr);saveDB();toast("Salvata nel tuo ricettario");sharedTmp=null;shareMode=false;hideSheet();location.hash="#ricettario";route()}}
  else if(a==="closeshared"){sharedTmp=null;shareMode=false;hideSheet()}
  else if(a==="edit"){var rr=getRecipe(id);if(rr)openEditor(rr,false)}
  else if(a==="new"){openEditor(null,false)}
  else if(a==="scan"){openEditor(null,true)}
  else if(a==="pickcam"){var fc=$("#fileCam");if(fc)fc.click()}
  else if(a==="pickgal"){var fg=$("#fileGal");if(fg)fg.click()}
  else if(a==="rmimg"){var d=collectDraft();d.img="";state.edit.draft=d;showSheet(sheetEdit())}
  else if(a==="save"){saveDraft()}
  else if(a==="del"){
    if(!confirm("Eliminare questa ricetta? Non si può annullare."))return;
    DB.mine=DB.mine.filter(function(x){return x.id!==id});DB.fav=DB.fav.filter(function(x){return x!==id});saveDB();hideSheet();toast("Ricetta eliminata");
    if(currentView()==="ricettario")renderRicettario();
  }
  else if(a==="restore"){
    if(!confirm("Tornare alla ricetta originale? Le tue modifiche andranno perse."))return;
    delete DB.over[id];saveDB();state.sheet.fresh=true;renderSheet();toast("Ricetta originale ripristinata");
    if(currentView()==="ricettario")renderRicettario();
  }
  else if(a==="export"){exportBackup()}
  else if(a==="import"){var fi=$("#fileImp");if(fi)fi.click()}
  else if(a==="tadd"){addTimer($("#tmM").value,$("#tmL").value.trim());$("#tmM").value="";$("#tmL").value=""}
  else if(a==="tpreset"){var tm=$("#tmM");if(tm)tm.value=t.dataset.m}
  else if(a==="tfull"){fullId=+id;renderTimers()}
  else if(a==="tmin"){fullId=null;renderTimers()}
  else if(a==="tplus"){var pt=timers.filter(function(x){return x.id===+id})[0];if(pt){pt.end+=60000;pt.total+=60;renderTimers()}}
  else if(a==="tstop"){timers=timers.filter(function(x){return x.id!==+id});if(fullId===+id)fullId=null;renderTimers()}
  else if(a==="tdel"){timers=timers.filter(function(x){return x.id!==+id});renderTimers()}
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&state.sheet&&state.sheet.t!=="edit")hideSheet();
});
document.addEventListener("input",function(e){
  var el=e.target;
  if(el.id==="q"){state.q=el.value;renderGrid()}
  else if(el.id==="rq"){state.rq=el.value;renderRicettario()}
  else if(el.id==="ckQ"){renderCookSug()}
});
document.addEventListener("change",function(e){
  var el=e.target;
  if(el.id==="fileImp"&&el.files&&el.files[0]){var fb=el.files[0];el.value="";importBackup(fb)}
  else if((el.id==="fileCam"||el.id==="fileGal")&&el.files&&el.files[0]){var f=el.files[0];el.value="";scanFile(f)}
});
window.addEventListener("hashchange",route);

menuApi=initMenu({DB:DB,esc:esc,IC:IC,getRecipe:getRecipe,allRecipes:allRecipes,BY:BY,RC:RC,TIPI:TIPI,fmtAmt:fmtAmt,saveDB:saveDB,toast:toast});
var prodApi=initProdotti({esc:esc,toast:toast,IC:IC,BY:BY,matchIng:matchIng,cookAdd:function(id){if(cookSel.indexOf(id)<0)cookSel.push(id);renderCook()}});
loadDB().then(function(){
  route();
  var sh=parseShared();
  if(sh){
    shareMode=true;
    if(sh.t==="custom"){sharedTmp=sh.rec;openSheet("rec",sh.rec.id,false)}else openSheet("rec",sh.id,false);
    try{history.replaceState(null,"",location.pathname+location.hash)}catch(e){}
  }
});
