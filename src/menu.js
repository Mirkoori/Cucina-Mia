// Menu: scegli le ricette, ottieni la lista della spesa (somma le quantità e raggruppa per reparto)
var CATORD=["Verdure","Frutta","Carne","Pesce","Latticini e uova","Dispensa","Erbe e spezie","Altro"];
export function initMenu(c){
  var DB=c.DB,esc=c.esc,IC=c.IC;
  var cur=null,pick=false,naming=false,q="",tipo="Tutte",tab="ricette";
  var SUG=["Cena di Natale","Pranzo della domenica","Cena tra amici"];
  function root(){return document.getElementById("menuRoot")}
  function getM(id){return DB.menus.filter(function(m){return m.id===id})[0]}
  function newId(){return "m"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
  function norm(s){return String(s).toLowerCase().replace(/[^a-zàèéìòù0-9]+/g," ").trim()}
  function cap(s){s=String(s).trim();return s.charAt(0).toUpperCase()+s.slice(1)}

  function shop(m){
    var map={};
    m.rec.forEach(function(rid){
      var r=c.getRecipe(rid);if(!r)return;
      var f=(m.pers||4)/(r.pers||4);
      (r.ing||[]).forEach(function(i){
        var key=i[3]||("n:"+norm(i[2]));
        var it=map[key]||(map[key]={key:key,id:i[3]||null,names:{},amts:{},qb:false,n:0});
        it.names[norm(i[2])]=i[2];it.n++;
        if(i[0]==null)it.qb=true;else{var u=i[1]||"",x=i[0]*f;if(u==="l"){u="ml";x*=1000}it.amts[u]=(it.amts[u]||0)+x}
      });
    });
    var groups={};
    Object.keys(map).forEach(function(k){
      var it=map[k],v=it.id?c.BY[it.id]:null,nm=Object.keys(it.names);
      it.name=nm.length===1?cap(it.names[nm[0]]):(v?v.n:cap(it.names[nm[0]]));
      it.cat=v&&CATORD.indexOf(v.cat)>-1?v.cat:"Altro";
      var parts=Object.keys(it.amts).map(function(u){return c.fmtAmt(it.amts[u],u,1)});
      it.amt=parts.length?parts.join(" + "):"q.b.";
      (groups[it.cat]=groups[it.cat]||[]).push(it);
    });
    return CATORD.filter(function(k){return groups[k]}).map(function(k){
      return {cat:k,items:groups[k].sort(function(a,b){return a.name.localeCompare(b.name,"it")})};
    });
  }

  function head(t,back){
    return '<div class="vh">'+(back?'<button class="iconbtn" data-act="m-back" aria-label="Indietro">'+IC.back+'</button>':'')+'<h2>'+esc(t)+'</h2></div>';
  }
  function renderList(){
    var h=head("I tuoi menu");
    h+='<div class="actions mact"><button class="btn pri" data-act="m-start">Crea un nuovo menu</button></div>';
    if(!DB.menus.length){
      h+='<div class="empty"><b>Nessun menu</b>Crea un menu, scegli le ricette e ottieni la lista della spesa già pronta.<div class="chips mchips">'+SUG.map(function(s){return '<button class="chip" data-act="m-new" data-n="'+esc(s)+'">'+esc(s)+'</button>'}).join("")+'</div></div>';
    }else{
      h+='<div class="rlist">'+DB.menus.map(function(m){
        var n=m.rec.filter(function(id){return c.getRecipe(id)}).length;
        return '<button class="rcard mcard" data-act="m-open" data-id="'+esc(m.id)+'" style="--c:#FFD9A0"><span class="nm">'+esc(m.n)+'</span><span class="mt"><span>'+n+(n===1?" ricetta":" ricette")+'</span><span>'+m.pers+" pers."+'</span></span></button>';
      }).join("")+'</div>';
    }
    root().innerHTML=h;
  }
  function stepper(m){
    return '<div class="stepper mstep"><button data-act="m-pers" data-d="-1" aria-label="Meno persone">'+IC.minus+'</button><output>'+m.pers+(m.pers===1?" persona":" persone")+'</output><button data-act="m-pers" data-d="1" aria-label="Più persone">'+IC.plus+'</button></div>';
  }
  function renderPick(m){
    var qq=q.trim().toLowerCase();
    var L=c.allRecipes().filter(function(r){
      if(tipo!=="Tutte"&&r.tipo!==tipo)return false;
      if(qq&&(r.n+" "+(r.reg||"")).toLowerCase().indexOf(qq)<0)return false;return true;
    }).sort(function(a,b){return a.n.localeCompare(b.n,"it")});
    var h=head("Scegli le ricette",false);
    h+='<div class="actions mact"><button class="btn pri" data-act="m-done">Fatto ('+m.rec.length+')</button></div>';
    h+='<label class="search"><input id="mq" type="search" placeholder="Cerca ricetta" autocomplete="off" value="'+esc(q)+'" aria-label="Cerca ricetta"></label>';
    h+='<div class="chips">'+c.TIPI.map(function(k){return '<button class="chip" data-act="m-tipo" data-k="'+esc(k)+'" aria-pressed="'+(tipo===k)+'">'+esc(k)+'</button>'}).join("")+'</div>';
    h+='<div class="mpick">'+L.map(function(r){
      var on=m.rec.indexOf(r.id)>-1;
      return '<button class="mrow'+(on?" on":"")+'" data-act="m-tog" data-id="'+esc(r.id)+'" aria-pressed="'+on+'"><span class="dot" style="background:'+(c.RC[r.reg]||"#FFD9A0")+'"></span><span class="mn"><b>'+esc(r.n)+'</b><i>'+esc(r.reg||"Mia ricetta")+' · '+esc(r.tipo||"")+'</i></span><span class="mk">'+(on?IC.check||"✓":IC.plus)+'</span></button>';
    }).join("")+(L.length?"":'<div class="empty">Nessuna ricetta trovata.</div>')+'</div>';
    root().innerHTML=h;
    var i=document.getElementById("mq");
  }
  function renderDetail(m){
    var h=head(m.n,true);
    h+='<div class="mmeta"><span>Per quante persone</span>'+stepper(m)+'</div>';
    h+='<div class="seg mseg" role="group"><button data-act="m-tab" data-k="ricette" aria-pressed="'+(tab==="ricette")+'">Ricette</button><button data-act="m-tab" data-k="spesa" aria-pressed="'+(tab==="spesa")+'">Lista della spesa</button></div>';
    if(tab==="ricette"){
      h+='<div class="actions mact"><button class="btn pri" data-act="m-pick">Aggiungi ricette</button></div>';
      var L=m.rec.map(function(id){return c.getRecipe(id)}).filter(Boolean);
      if(!L.length)h+='<div class="empty"><b>Menu vuoto</b>Tocca «Aggiungi ricette» e scegli i piatti: antipasto, primo, secondo, dolce…</div>';
      else h+=L.map(function(r){
        return '<div class="mrow2"><button class="mrow" data-act="rec" data-id="'+esc(r.id)+'"><span class="dot" style="background:'+(c.RC[r.reg]||"#FFD9A0")+'"></span><span class="mn"><b>'+esc(r.n)+'</b><i>'+esc(r.reg||"Mia ricetta")+' · '+esc(r.tipo||"")+'</i></span></button><button class="mrm" data-act="m-rm" data-id="'+esc(r.id)+'" aria-label="Togli dal menu">'+IC.x+'</button></div>';
      }).join("");
      h+='<div class="actions mact" style="margin-top:18px"><button class="btn" data-act="m-ren">Rinomina</button><button class="btn" data-act="m-del">Elimina menu</button></div>';
    }else{
      var G=shop(m);
      if(!G.length)h+='<div class="empty"><b>Lista vuota</b>Aggiungi qualche ricetta al menu per vedere cosa comprare.</div>';
      else{
        var tot=0,done=0;
        G.forEach(function(g){g.items.forEach(function(it){tot++;if(m.done[it.key])done++})});
        h+='<div class="count">'+done+" di "+tot+" già presi · per "+m.pers+(m.pers===1?" persona":" persone")+'</div>';
        h+=G.map(function(g){
          return '<div class="mcat"><h3>'+esc(g.cat)+'</h3>'+g.items.map(function(it){
            var d=!!m.done[it.key];
            return '<button class="mit'+(d?" on":"")+'" data-act="m-chk" data-k="'+esc(it.key)+'" aria-pressed="'+d+'"><span class="bx">'+(d?"✓":"")+'</span><span class="mn">'+esc(it.name)+'</span><span class="ma">'+esc(it.amt)+'</span></button>';
          }).join("")+'</div>';
        }).join("");
        h+='<div class="actions mact"><button class="btn pri" data-act="m-copy">Copia o condividi</button><button class="btn" data-act="m-reset">Azzera spunte</button></div>';
        h+='<p class="foot">Le quantità sono sommate tra le ricette e adattate alle persone. Controlla sempre cosa hai già in casa.</p>';
      }
    }
    root().innerHTML=h;
  }
  function renderNaming(){
    var h=head("Nuovo menu",true);
    h+='<p class="lbl">Come lo chiami?</p><div class="mnew"><input id="mName" type="text" maxlength="40" placeholder="Es. Cena di Natale" aria-label="Nome del menu" autocomplete="off"><button class="btn pri" data-act="m-new">Crea</button></div>';
    h+='<div class="chips mchips">'+SUG.map(function(x){return '<button class="chip" data-act="m-sug" data-n="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>';
    root().innerHTML=h;
    var el=document.getElementById("mName");if(el)el.focus();
  }
  function render(){
    if(!root())return;
    if(naming&&!cur){renderNaming();return}
    var m=cur?getM(cur):null;
    if(!m){cur=null;pick=false;renderList();return}
    if(pick)renderPick(m);else renderDetail(m);
  }
  function listText(m){
    var s="Lista della spesa – "+m.n+" ("+m.pers+" pers.)\n";
    shop(m).forEach(function(g){s+="\n"+g.cat+"\n";g.items.forEach(function(it){s+="- "+it.name+": "+it.amt+"\n"})});
    return s;
  }
  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-act]");if(!t)return;
    var a=t.dataset.act;if(a.slice(0,2)!=="m-")return;
    var m=cur?getM(cur):null,id=t.dataset.id;
    if(a==="m-start"){naming=true;render();return}
    if(a==="m-sug"){var inp=document.getElementById("mName");if(inp){inp.value=t.dataset.n;inp.focus()}return}
    if(a==="m-new"){
      var el=document.getElementById("mName"),n=(t.dataset.n||(el&&el.value)||"").trim();
      if(!n){toast("Scrivi un nome per il menu");return}
      naming=false;var nm={id:newId(),n:n,pers:4,rec:[],done:{}};DB.menus.unshift(nm);c.saveDB();cur=nm.id;tab="ricette";pick=true;q="";tipo="Tutte";render();window.scrollTo(0,0);return;
    }
    if(a==="m-open"){cur=id;tab="ricette";pick=false;render();window.scrollTo(0,0);return}
    if(a==="m-back"){cur=null;pick=false;naming=false;render();return}
    if(!m)return;
    if(a==="m-pers"){m.pers=Math.max(1,Math.min(50,m.pers+(+t.dataset.d)));c.saveDB();render()}
    else if(a==="m-tab"){tab=t.dataset.k;render()}
    else if(a==="m-pick"){pick=true;q="";tipo="Tutte";render();window.scrollTo(0,0)}
    else if(a==="m-done"){pick=false;render();window.scrollTo(0,0)}
    else if(a==="m-tipo"){tipo=t.dataset.k;var sc=window.scrollY;render();window.scrollTo(0,sc)}
    else if(a==="m-tog"){var i=m.rec.indexOf(id);if(i>-1)m.rec.splice(i,1);else m.rec.push(id);c.saveDB();var s2=window.scrollY;render();window.scrollTo(0,s2)}
    else if(a==="m-rm"){m.rec=m.rec.filter(function(x){return x!==id});c.saveDB();render()}
    else if(a==="m-chk"){var k=t.dataset.k;if(m.done[k])delete m.done[k];else m.done[k]=1;c.saveDB();var s3=window.scrollY;render();window.scrollTo(0,s3)}
    else if(a==="m-reset"){m.done={};c.saveDB();render()}
    else if(a==="m-ren"){var nn=prompt("Nuovo nome del menu",m.n);if(nn&&nn.trim()){m.n=nn.trim().slice(0,40);c.saveDB();render()}}
    else if(a==="m-del"){if(!confirm("Eliminare questo menu? Non si può annullare."))return;DB.menus=DB.menus.filter(function(x){return x.id!==m.id});c.saveDB();cur=null;render();toast("Menu eliminato")}
    else if(a==="m-copy"){
      var txt=listText(m);
      if(navigator.share){navigator.share({title:"Lista della spesa – "+m.n,text:txt}).catch(function(){})}
      else if(navigator.clipboard){navigator.clipboard.writeText(txt).then(function(){toast("Lista copiata")},function(){toast("Non riesco a copiare")})}
      else toast("Non riesco a copiare");
    }
  });
  document.addEventListener("input",function(e){
    if(e.target.id==="mq"){q=e.target.value;var el=e.target,pos=el.selectionStart;render();var n=document.getElementById("mq");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
  });
  function toast(s){c.toast(s)}
  return {render:render};
}
