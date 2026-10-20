const API="https://rfqzigivlejdxdnqvlzw.supabase.co/functions/v1/matters-chicken-api";
const app=document.getElementById("app");
const state={mode:null,step:0,data:{}};

function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1800)}
function enc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function wrap(content){app.innerHTML='<div class="wrap">'+content+'</div>'}
function home(){
  state.mode=null;state.step=0;state.data={};
  wrap(`<section class="hero">
    <div class="eyebrow">Lycée Hôtelier de Tahiti · TP 2026</div>
    <div class="logo">🐔</div>
    <h1>Matter's Chicken</h1>
    <p class="sub">Votre retour nous aide à améliorer nos prochains services. Deux minutes suffisent.</p>
  </section>
  <section class="card grid two">
    <button class="choice-big" onclick="start('client')"><span class="icon">🍽️</span><span><strong>Je suis client</strong><span>Donner mon avis sur l'expérience et les plats</span></span></button>
    <button class="choice-big" onclick="start('collab')"><span class="icon">🤝</span><span><strong>Je fais partie de l'équipe</strong><span>Partager mon retour sur l'organisation et le management</span></span></button>
  </section>
  <div class="admin-link"><a href="#qr">QR codes</a> · <a href="#results">Résultats</a></div>`);
}
function start(mode){state.mode=mode;state.step=0;state.data={};renderForm()}
function setVal(k,v){state.data[k]=v;renderForm()}
function next(required){if(required && required.some(k=>state.data[k]===undefined||state.data[k]===null||state.data[k]==="")){toast("Merci de répondre avant de continuer.");return}state.step++;renderForm()}
function prev(){if(state.step>0){state.step--;renderForm()}else home()}
function progress(total){return `<div class="progress"><div style="width:${Math.round(((state.step+1)/total)*100)}%"></div></div>`}
function option(k,v,label){return `<button class="opt ${state.data[k]===v?'selected':''}" onclick="setVal('${k}','${v}')"><span>${label}</span><span>${state.data[k]===v?'✓':''}</span></button>`}
function scale(k,max=5){
  return `<div class="scale ${max===4?'scale4':''}">${Array.from({length:max},(_,i)=>i+1).map(n=>`<button class="${state.data[k]===n?'selected':''}" onclick="setVal('${k}',${n})">${n}</button>`).join("")}</div>`
}
function top(title,total){return `<div class="topbar"><button class="back" onclick="prev()">← Retour</button><small>${state.step+1}/${total}</small></div>${progress(total)}<h2>${title}</h2>`}
const clientQs=[
  {k:"menu",t:"Quel menu avez-vous dégusté ?",type:"opts",opts:[["classique","Menu classique"],["vegetarien","Menu végétarien"]]},
  {k:"accueil",t:"Chaleur de l'accueil à votre arrivée",type:"sat4"},
  {k:"confort",t:"Confort de la salle",type:"sat4"},
  {k:"rapidite",t:"Rapidité du service",type:"sat4"},
  {k:"disponibilite",t:"Disponibilité de l'équipe en salle",type:"sat4"},
  {k:"explications",t:"Clarté des explications sur les plats",type:"sat4"},
  {k:"entree_note",t:"Bouillon, ravioles champignons-butternut et œuf parfait",type:"note5"},
  {k:"plat_note",t:()=>state.data.menu==="vegetarien"?"Steaks de chou-fleur & brocoli, risotto bicolore betterave / Réa Tahiti, jus végétal au Réa":"Volaille en deux cuissons, risotto aux asperges vertes et jus au Réa Tahiti",type:"note5"},
  {k:"dessert_note",t:"Chou craquelin façon Pop Corn Chicken",type:"note5"},
  {k:"temperature",t:"Pour les plats servis chauds, la température vous a semblé :",type:"opts",opts:[["trop_basse","Trop basse"],["adaptee","Adaptée"],["trop_elevee","Trop élevée"]]},
  {k:"attente",t:"Le temps d'attente entre les plats vous a semblé :",type:"opts",opts:[["trop_court","Trop court"],["adapte","Adapté"],["trop_long","Trop long"]]},
  {k:"recommandation",t:"Recommanderiez-vous cette expérience ?",type:"opts",opts:[["oui","Oui"],["peut_etre","Peut-être"],["non","Non"]]},
  {k:"amelioration",t:"Quel est le principal point que nous pourrions améliorer ?",type:"text",optional:true}
];
const collabQs=[
 {k:"equipe",t:"Dans quelle équipe avez-vous principalement travaillé ?",type:"opts",opts:[["cuisine","Cuisine"],["salle","Salle"],["accueil","Accueil"],["polyvalent","Polyvalent"]]},
 {k:"roles",t:"Clarté de la répartition des rôles",type:"sat4"},
 {k:"consignes",t:"Clarté des consignes du management",type:"sat4"},
 {k:"communication",t:"Communication dans l'équipe",type:"sat4"},
 {k:"ecoute",t:"Écoute de vos remarques et propositions",type:"sat4"},
 {k:"accompagnement",t:"Accompagnement en cas de difficulté",type:"sat4"},
 {k:"reconnaissance",t:"Reconnaissance de votre implication",type:"sat4"},
 {k:"coordination",t:"Coordination entre la cuisine et la salle",type:"sat4"},
 {k:"priorite",t:"Quel point devrait être amélioré en priorité ?",type:"opts",opts:[["Répartition des rôles","Répartition des rôles"],["Consignes","Consignes"],["Communication","Communication"],["Accompagnement","Accompagnement"],["Reconnaissance","Reconnaissance"],["Coordination cuisine-salle","Coordination cuisine-salle"],["Autre","Autre"]]},
 {k:"action_concrete",t:"Quelle action concrète proposeriez-vous pour le prochain TP ?",type:"text",optional:true}
];
function renderForm(){
 const qs=state.mode==="client"?clientQs:collabQs,total=qs.length;
 if(state.step>=total){submit();return}
 const q=qs[state.step],title=typeof q.t==="function"?q.t():q.t;
 let body="";
 if(q.type==="opts") body=`<div class="options">${q.opts.map(o=>option(q.k,o[0],o[1])).join("")}</div>`;
 if(q.type==="sat4") body=`<div class="helper">1 = Insatisfaisant · 4 = Très satisfaisant</div>${scale(q.k,4)}<div class="scale-labels"><span>Insatisfaisant</span><span>Très satisfaisant</span></div>`;
 if(q.type==="note5") body=`<div class="helper">1 = Très décevant · 5 = Excellent</div>${scale(q.k,5)}<div class="scale-labels"><span>Très décevant</span><span>Excellent</span></div>`;
 if(q.type==="text") body=`<textarea placeholder="Votre réponse…" oninput="state.data['${q.k}']=this.value">${enc(state.data[q.k]||"")}</textarea>`;
 const intro=state.step===0?`<p class="sub" style="text-align:left;margin:8px 0 18px">${state.mode==="client"?"Merci de prendre une minute pour nous aider à améliorer l’expérience Matter’s Chicken. Vos réponses sont anonymes et nous permettront d’identifier les points forts et les axes d’amélioration.":"Dans une démarche de co-construction du management, ce questionnaire anonyme a pour objectif de recueillir votre ressenti et vos propositions afin d’améliorer ensemble l’organisation, la communication et l’accompagnement lors de nos prochains TP."}</p>`:"";
 wrap(`<section class="card">${top(state.mode==="client"?"Questionnaire client":"Questionnaire collaborateurs",total)}${intro}<h3 class="qtitle">${title}</h3>${q.optional?'<div class="helper">Facultatif</div>':''}${body}<div class="actions"><button class="btn primary" onclick="next(${q.optional?'[]':"['"+q.k+"']"})">${state.step===total-1?'Envoyer':'Continuer →'}</button></div></section>`);
}
async function submit(){
 const path=state.mode==="client"?"client":"collaborateur";
 wrap('<section class="card success"><div class="logo">⏳</div><h2>Envoi en cours…</h2></section>');
 try{
  const r=await fetch(API+"/"+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(state.data)});
  const j=await r.json();
  if(!r.ok||!j.ok) throw new Error(j.error||"Erreur");
  const msg=state.mode==="client"?"Merci pour votre participation. Votre avis nous aidera à améliorer nos prochains services.":"Merci pour votre participation et pour vos suggestions. Vos réponses seront analysées de manière anonyme et les principaux résultats, ainsi que les actions d’amélioration retenues, seront présentés de manière transparente lors du prochain briefing.";
  wrap(`<section class="card success"><div class="check">✓</div><h2>Merci !</h2><p class="sub">${msg}</p><button class="btn primary" style="margin-top:20px" onclick="home()">Retour à l'accueil</button></section>`);
 }catch(e){
  wrap(`<section class="card success"><div class="check">⚠️</div><h2>Envoi impossible</h2><p class="sub">Vérifiez votre connexion puis réessayez.</p><button class="btn primary" style="margin-top:20px" onclick="submit()">Réessayer</button></section>`)
 }
}
function qrPage(){
 const base=location.origin+location.pathname.replace(/[^/]*$/,"");
 const client=base+"#client",collab=base+"#collaborateur";
 wrap(`<section class="card"><div class="topbar"><button class="back" onclick="home()">← Accueil</button></div><h2>QR codes</h2><p class="sub" style="text-align:left">À imprimer ou afficher pour accéder directement au bon questionnaire.</p>
 <div class="qr-grid"><div class="qr-card"><h3>Client</h3><canvas id="qrc"></canvas><div class="copyrow"><input value="${client}" readonly><button class="btn secondary" onclick="navigator.clipboard.writeText('${client}').then(()=>toast('Lien copié'))">Copier</button></div><button class="btn gold" style="margin-top:10px" onclick="downloadQR('qrc','QR-Matters-Chicken-Client.png')">Télécharger le QR</button></div>
 <div class="qr-card"><h3>Collaborateurs</h3><canvas id="qrk"></canvas><div class="copyrow"><input value="${collab}" readonly><button class="btn secondary" onclick="navigator.clipboard.writeText('${collab}').then(()=>toast('Lien copié'))">Copier</button></div><button class="btn gold" style="margin-top:10px" onclick="downloadQR('qrk','QR-Matters-Chicken-Collaborateurs.png')">Télécharger le QR</button></div></div></section>`);
 QRCode.toCanvas(document.getElementById("qrc"),client,{width:240,margin:2});
 QRCode.toCanvas(document.getElementById("qrk"),collab,{width:240,margin:2});
}
function downloadQR(id,name){const a=document.createElement("a");a.download=name;a.href=document.getElementById(id).toDataURL("image/png");a.click()}
function resultsLogin(){
 wrap(`<section class="card"><div class="topbar"><button class="back" onclick="home()">← Accueil</button></div><h2>Résultats</h2><p class="sub" style="text-align:left">Accès réservé à l'équipe projet.</p><input id="code" type="password" placeholder="Code d'accès" style="width:100%;padding:14px;border:1px solid var(--line);border-radius:14px;margin-top:16px"><button class="btn primary" style="width:100%;margin-top:10px" onclick="loadResults()">Afficher les résultats</button></section>`)
}
function avg(rows,k){if(!rows.length)return "—";return (rows.reduce((a,r)=>a+Number(r[k]||0),0)/rows.length).toFixed(1)}
async function loadResults(){
 const code=document.getElementById("code").value;
 if(!code){toast("Entre le code d'accès.");return}
 wrap('<section class="card success"><div class="logo">⏳</div><h2>Chargement…</h2></section>');
 try{
  const r=await fetch(API+"/results?code="+encodeURIComponent(code));const j=await r.json();
  if(!r.ok||!j.ok) throw new Error("Accès refusé");
  renderResults(j,code);
 }catch(e){resultsLogin();toast("Code incorrect ou erreur réseau.")}
}
function renderResults(j,code){
 const c=j.clients||[],k=j.collaborateurs||[];
 const csvBtn=`<button class="btn secondary" onclick='exportCSV(${JSON.stringify(c).replace(/'/g,"&#39;")},"clients")'>Export CSV clients</button> <button class="btn secondary" onclick='exportCSV(${JSON.stringify(k).replace(/'/g,"&#39;")},"collaborateurs")'>Export CSV collaborateurs</button>`;
 wrap(`<section class="card"><div class="topbar"><button class="back" onclick="home()">← Accueil</button><button class="btn secondary" onclick="location.hash='qr'">QR codes</button></div><h2>Résultats Matter's Chicken</h2>
 <div class="statgrid"><div class="stat"><span>Réponses clients</span><b>${c.length}</b></div><div class="stat"><span>Réponses équipe</span><b>${k.length}</b></div><div class="stat"><span>Moy. entrée</span><b>${avg(c,"entree_note")}/5</b></div><div class="stat"><span>Moy. dessert</span><b>${avg(c,"dessert_note")}/5</b></div></div>
 <h3>Clients</h3><div class="tablewrap"><table><thead><tr><th>Date</th><th>Menu</th><th>Accueil</th><th>Service</th><th>Entrée</th><th>Plat</th><th>Dessert</th><th>Recommande</th><th>Amélioration</th></tr></thead><tbody>${c.map(r=>`<tr><td>${new Date(r.created_at).toLocaleString("fr-FR")}</td><td>${enc(r.menu)}</td><td>${r.accueil}/4</td><td>${r.rapidite}/4</td><td>${r.entree_note}/5</td><td>${r.plat_note}/5</td><td>${r.dessert_note}/5</td><td>${enc(r.recommandation)}</td><td>${enc(r.amelioration||"")}</td></tr>`).join("")}</tbody></table></div>
 <h3 style="margin-top:20px">Collaborateurs</h3><div class="tablewrap"><table><thead><tr><th>Date</th><th>Équipe</th><th>Rôles</th><th>Consignes</th><th>Communication</th><th>Coordination</th><th>Priorité</th><th>Action</th></tr></thead><tbody>${k.map(r=>`<tr><td>${new Date(r.created_at).toLocaleString("fr-FR")}</td><td>${enc(r.equipe)}</td><td>${r.roles}/4</td><td>${r.consignes}/4</td><td>${r.communication}/4</td><td>${r.coordination}/4</td><td>${enc(r.priorite)}</td><td>${enc(r.action_concrete||"")}</td></tr>`).join("")}</tbody></table></div>
 <div class="actions">${csvBtn}</div></section>`);
}
function exportCSV(rows,name){if(!rows.length){toast("Aucune donnée.");return}const keys=Object.keys(rows[0]);const esc=v=>'"'+String(v??"").replace(/"/g,'""')+'"';const csv=[keys.join(";"),...rows.map(r=>keys.map(k=>esc(r[k])).join(";"))].join("\n");const b=new Blob([csv],{type:"text/csv;charset=utf-8;"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name+"-matters-chicken.csv";a.click();URL.revokeObjectURL(a.href)}
function route(){const h=location.hash.toLowerCase();if(h==="#client"){start("client")}else if(h==="#collaborateur"){start("collab")}else if(h==="#qr"){qrPage()}else if(h==="#results"){resultsLogin()}else home()}
window.addEventListener("hashchange",route);route();
