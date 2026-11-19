// Scansiona un prodotto: dati da Open Food Facts (open data, licenza ODbL).
export function initProdotti(c){
  var esc=c.esc,toast=c.toast;
  var API="https://world.openfoodfacts.org";
  var F="code,product_name,product_name_it,brands,quantity,image_front_small_url,nutriscore_grade,nova_group,ingredients_text_it,ingredients_text,allergens_tags,nutriments";
  var ALL={milk:"latte",gluten:"glutine",eggs:"uova",nuts:"frutta a guscio",peanuts:"arachidi",soybeans:"soia",fish:"pesce",crustaceans:"crostacei",molluscs:"molluschi",celery:"sedano",mustard:"senape","sesame-seeds":"sesamo","sulphur-dioxide-and-sulphites":"solfiti",lupin:"lupini"};
  var NS={a:"#038141",b:"#85BB2F",c:"#FECB02",d:"#EE8100",e:"#E63E11"};
  var cur=null,scan=null;

  function html(){
    return '<section class="tool"><h3>Scansiona un prodotto</h3><p class="sub">Inquadra il codice a barre di una confezione, oppure scrivilo o cerca per nome: vedi Nutri-Score, calorie, allergeni e ingredienti.</p>'+
      '<button class="btn pri" data-act="pf-scan" style="width:100%">Inquadra il codice a barre</button>'+
      '<div class="two" style="margin-top:12px"><label class="fld"><span>Codice a barre</span><input id="pfCode" type="text" inputmode="numeric" placeholder="8001234567890" maxlength="14"></label>'+
      '<label class="fld"><span>Oppure nome</span><input id="pfName" type="search" placeholder="Es. passata di pomodoro" maxlength="60"></label></div>'+
      '<div style="margin-top:10px"><button class="btn" data-act="pf-find" style="width:100%">Cerca</button></div>'+
      '<div id="pfOut" aria-live="polite"></div>'+
      '<p class="foot" style="margin-top:12px">Dati: <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a> (licenza ODbL), un database collaborativo: possono mancare dati o contenere errori. Per allergie, controlla sempre l’etichetta.</p></section>';
  }
  function out(h){var o=document.getElementById("pfOut");if(o)o.innerHTML=h}
  function getJSON(url){
    var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},12000);
    return fetch(url,{signal:ctl.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error("http "+r.status);return r.json()}).catch(function(e){clearTimeout(t);throw e});
  }
  function num(v,d){v=parseFloat(v);return isNaN(v)?"—":(Math.round(v*Math.pow(10,d||0))/Math.pow(10,d||0)).toString().replace(".",",")}
  function lookup(code){
    code=String(code).replace(/\D/g,"");
    if(code.length<8){toast("Il codice deve avere almeno 8 cifre");return}
    out('<p class="note">Cerco il prodotto…</p>');
    getJSON(API+"/api/v2/product/"+code+".json?fields="+F).then(function(d){
      if(!d||d.status!==1||!d.product){out('<p class="note">Prodotto non trovato nel database ('+esc(code)+'). Prova con la ricerca per nome.</p>');return}
      show(d.product,code);
    }).catch(function(){out('<p class="note">Non riesco a contattare Open Food Facts. Controlla la connessione e riprova.</p>')});
  }
  function search(q){
    q=q.trim();if(q.length<2){toast("Scrivi almeno 2 lettere");return}
    out('<p class="note">Cerco…</p>');
    getJSON(API+"/cgi/search.pl?search_terms="+encodeURIComponent(q)+"&search_simple=1&action=process&json=1&page_size=8&lc=it&cc=it&fields="+F).then(function(d){
      var L=(d&&d.products||[]).filter(function(p){return p.code&&(p.product_name_it||p.product_name)});
      if(!L.length){out('<p class="note">Nessun prodotto trovato.</p>');return}
      out('<p class="lbl" style="margin-top:14px">'+L.length+' prodotti</p>'+L.map(function(p){
        return '<button class="rrow" data-act="pf-open" data-code="'+esc(p.code)+'" style="--c:#FFD9A0;margin-bottom:8px"><span><b>'+esc(p.product_name_it||p.product_name)+'</b><small>'+esc(p.brands||"")+(p.nutriscore_grade&&NS[p.nutriscore_grade]?" · Nutri-Score "+esc(p.nutriscore_grade.toUpperCase()):"")+'</small></span>'+c.IC.next+'</button>';
      }).join(""));
    }).catch(function(){out('<p class="note">Non riesco a contattare Open Food Facts. Controlla la connessione e riprova.</p>')});
  }
  function show(p,code){
    var n=p.nutriments||{},name=p.product_name_it||p.product_name||"Prodotto senza nome",ns=(p.nutriscore_grade||"").toLowerCase();
    var al=(p.allergens_tags||[]).map(function(t){var k=String(t).replace(/^[a-z]{2}:/,"");return ALL[k]||k}).filter(Boolean);
    var ing=p.ingredients_text_it||p.ingredients_text||"";
    var id=c.matchIng(name);cur={name:name,id:id&&c.BY[id]?id:null};
    var row=function(l,v,u){return '<div><b>'+v+(u?'<small style="display:inline;margin-left:2px">'+u+'</small>':'')+'</b><small>'+l+'</small></div>'};
    out('<div class="pfcard">'+
      '<div class="pfhead">'+(p.image_front_small_url&&/^https:\/\//.test(p.image_front_small_url)?'<img src="'+esc(p.image_front_small_url)+'" alt="" loading="lazy">':'')+
        '<div><h4>'+esc(name)+'</h4><p>'+esc([p.brands,p.quantity].filter(Boolean).join(" · "))+'</p></div></div>'+
      '<div class="pfbadges">'+(NS[ns]?'<span class="pfns" style="background:'+NS[ns]+';color:'+(ns==="c"?"#2A1710":"#fff")+'">Nutri-Score '+ns.toUpperCase()+'</span>':'<span class="pill">Nutri-Score non disponibile</span>')+(p.nova_group?'<span class="pill">NOVA '+esc(String(p.nova_group))+'</span>':'')+'</div>'+
      '<p class="lbl">Per 100 g</p><div class="conv-out pfgrid">'+row("calorie",num(n["energy-kcal_100g"]),"kcal")+row("grassi",num(n.fat_100g,1),"g")+row("zuccheri",num(n.sugars_100g,1),"g")+row("proteine",num(n.proteins_100g,1),"g")+row("sale",num(n.salt_100g,2),"g")+row("fibre",num(n.fiber_100g,1),"g")+'</div>'+
      '<p class="lbl">Allergeni</p><p>'+(al.length?al.map(function(x){return '<span class="pill">'+esc(x)+'</span>'}).join(" "):'<span class="note">Nessuno dichiarato nel database</span>')+'</p>'+
      (ing?'<p class="lbl">Ingredienti</p><p class="cons">'+esc(ing.slice(0,900))+(ing.length>900?"…":"")+'</p>':'')+
      (cur.id?'<button class="btn pri" data-act="pf-cook" style="width:100%;margin-top:10px">Ce l’ho: usa in «Cosa posso cucinare» ('+esc(c.BY[cur.id].n)+')</button>':'')+
      '</div>');
  }

  /* ---- fotocamera ---- */
  async function openScan(){
    if(scan)return;
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast("La fotocamera non è disponibile: scrivi il codice");return}
    var box=document.createElement("div");box.className="pfscan";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");
    box.innerHTML='<video playsinline muted autoplay></video><div class="pfframe" aria-hidden="true"></div><p>Inquadra il codice a barre</p><button class="btn" data-act="pf-close">Chiudi</button>';
    document.body.appendChild(box);document.body.style.overflow="hidden";
    var video=box.querySelector("video");scan={box:box,stop:function(){}};
    var done=false;
    function got(txt){if(done)return;done=true;closeScan();var d=String(txt).replace(/\D/g,"");var i=document.getElementById("pfCode");if(i)i.value=d;lookup(d)}
    try{
      if("BarcodeDetector" in window){
        var stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
        video.srcObject=stream;await video.play().catch(function(){});
        var det=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});
        var iv=setInterval(function(){
          if(video.readyState<2)return;
          det.detect(video).then(function(r){if(r&&r.length)got(r[0].rawValue)}).catch(function(){});
        },250);
        scan.stop=function(){clearInterval(iv);stream.getTracks().forEach(function(t){t.stop()})};
      }else{
        var Z=await import("@zxing/browser");
        var reader=new Z.BrowserMultiFormatReader();
        var ctl=await reader.decodeFromConstraints({video:{facingMode:{ideal:"environment"}},audio:false},video,function(res){if(res)got(res.getText())});
        scan.stop=function(){try{ctl.stop()}catch(e){}};
      }
    }catch(e){closeScan();toast("Non riesco ad aprire la fotocamera: scrivi il codice")}
  }
  function closeScan(){
    if(!scan)return;
    try{scan.stop()}catch(e){}
    scan.box.remove();scan=null;document.body.style.overflow="";
  }
  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-act]");if(!t)return;var a=t.dataset.act;if(a.slice(0,3)!=="pf-")return;
    if(a==="pf-scan")openScan();
    else if(a==="pf-close")closeScan();
    else if(a==="pf-find"){var code=document.getElementById("pfCode").value.trim(),nm=document.getElementById("pfName").value.trim();if(code)lookup(code);else if(nm)search(nm);else toast("Scrivi un codice o un nome")}
    else if(a==="pf-open")lookup(t.dataset.code);
    else if(a==="pf-cook"){if(cur&&cur.id){c.cookAdd(cur.id);toast("Aggiunto a «Cosa posso cucinare»")}}
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Enter"&&(e.target.id==="pfCode"||e.target.id==="pfName")){e.preventDefault();var code=document.getElementById("pfCode").value.trim(),nm=document.getElementById("pfName").value.trim();if(e.target.id==="pfCode"&&code)lookup(code);else if(nm)search(nm);else if(code)lookup(code)}
  });
  return {html:html};
}
