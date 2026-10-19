/* Comic Vault v10.59: film-scoped Friday sequel presentation. No original dossier mutation. */
(()=>{'use strict';
const api=window.ComicVaultFridayPart21059=window.ComicVaultFridayPart21059||{};
const film='friday-the-13th-part-2-1981-theatrical';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=x=>Array.isArray(x)?x:x?[x]:[];
const text=x=>list(x).map(p=>'<p>'+esc(typeof p==='string'?p:p.detail||p.text||p.name||'')+'</p>').join('');
const title=c=>c?.sourceFilmId===film?'Friday the 13th Part 2 (1981)':'Friday the 13th (1980)';
api.title=title;
api.copy=(c,kind)=>{
 const t=title(c),sequel=(window.ComicVaultFriday1050?.filmSupplements?.[c?.imageSlug]||[]).some(s=>s.sourceFilmId===film);
 const extra=sequel?' The separate Part 2 continuation is labeled below.':'';
 return ({films:t+' anchors this dossier. Film-specific accounts keep each appearance in its own scope; later unresearched sequels are excluded. Contains spoilers.',story:'The baseline account follows '+t+'.'+extra+' Film references are collected under Films.',abilities:'This baseline uses '+t+'. Named skills and limitations follow that film; observations from another movie do not change these original comparison ratings. Unrated means evidence does not justify a numerical placement. N/A means a capability is not established.',evidence:'Friday the 13th research uses film catalogs, film references, production interviews and labeled secondary cross-checks. Each film is separately scoped. No complete film viewing was performed for this research; unsupported numerical ratings remain Unrated.',relationships:'Connections in this baseline are scoped to '+t+'.'+extra,conflicts:'Encounters in this baseline are scoped to '+t+'.'+extra})[kind]||'';
};
function sources(ids=[]){const maps=[api.data?.graph?.sources,api.data?.filmAppearanceCatalog?.sources,window.ComicVaultFriday1050?.graph?.sources,window.ComicVaultFriday1050?.movieTrivia?.sources];const used=new Set();return '<ul>'+ids.flatMap(id=>{let s;for(const m of maps){s=Array.isArray(m)?m.find(x=>x.id===id):m?.[id];if(s)break;}if(!s||used.has(id))return [];used.add(id);const name=s.title||s.label||id;return ['<li>'+(/^https?:\/\//.test(s.url||'')?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a>':esc(name))+'</li>'];}).join('')+'</ul>';}
api.appendHistory=(host,c,tab,state)=>{
 if(c?.publisher!=='FRIDAY13'||!state.fullHistory)return;
 if(c.sourceFilmId===film&&tab==='allies'&&list(c.biographyRelationships).length){
  const section=document.createElement('section');section.className='body-section reader-module cv-friday-biography1059';section.dataset.fridayBiography1059=c.imageSlug;
  section.innerHTML='<div class="section-kicker">RELATIONSHIPS IN THE FILM BIOGRAPHY · SPOILERS</div><h3>People in Friday the 13th Part 2 (1981)</h3><p>These are film-specific encounters and shared events, not a claim that every connection is a friendship.</p>'+list(c.biographyRelationships).map(r=>'<article><small>'+esc(r.type||'Film connection')+'</small><h4>'+(r.targetSlug?'<button type="button" data-cv-film-character1046="'+esc(r.targetSlug)+'" data-cv-film1046="'+film+'">'+esc(r.name||'Open character')+'</button>':esc(r.name||'Film connection'))+'</h4>'+text(r.history)+sources(r.sourceIds)+'</article>').join('');host.append(section);
 }
 const s=(window.ComicVaultFriday1050?.filmSupplements?.[c.imageSlug]||[]).find(x=>x.sourceFilmId===film);if(!s)return;
 const snap=window.ComicVaultFriday1050?.movieDetails?.characterSnapshots?.[c.imageSlug]?.[film]||{};
 let body='';
 if(tab==='overview'||tab==='history'){
  body=text(tab==='overview'?(snap.background||s.background):[]) + text(s.paragraphs||snap.role);
  if(tab==='history')body+=list(s.keyEvents||snap.events).map(x=>'<article><h4>'+esc(x.title||'')+'</h4>'+text(x.detail||x.text)+'</article>').join('');
  body+='<h4>Status at this film’s ending</h4>'+text(s.status||snap.status);
 }else if(tab==='powers')body=list(s.abilities||snap.abilities).map(x=>'<article><h4>'+esc(x.title||'Film observation')+'</h4>'+text(x.detail)+'</article>').join('')+'<p>These film-specific observations do not replace the original baseline comparison ratings.</p>';
 else if(tab==='gear')body=list(s.gear||snap.gear).map(x=>typeof x==='string'?text(x):'<article><h4>'+esc(x.name||x.title||'Equipment')+'</h4>'+text(x.detail||x.text)+'</article>').join('');
 else if(tab==='costumes')body=text(s.costumeDescription||snap.costume)+(s.illustrationNote?'<h4>Illustration note</h4>'+text(s.illustrationNote):'');
 else if(tab==='allies'||tab==='enemies'){
  const g=window.ComicVaultFriday1050?.graph;const edges=(g?.edges||[]).filter(e=>e.sourceFilmId===film&&[e.a,e.b].some(id=>g.nodes[id]?.recordSlug===c.imageSlug)&&(tab!=='enemies'||(e.tags||[]).some(t=>/enemy|enemies|victim|conflict/i.test(t))));
  body=edges.map(e=>{const n=g.nodes[g.nodes[e.a]?.recordSlug===c.imageSlug?e.b:e.a];return '<article><h4><button type="button" data-cv-film-character1046="'+esc(n?.recordSlug)+'" data-cv-film1046="'+film+'">'+esc(n?.hero||n?.name||'Connection')+'</button></h4>'+text(e.detail)+'</article>';}).join('')||'<p>No additional relationship is established for this film appearance.</p>';
 }else if(tab==='comics')body='<p>Read the separate 1981 appearance without changing the 1980 baseline.</p><button type="button" data-cv-movie-info1046="'+film+'">Open the Part 2 movie dossier</button>';
 if(tab==='costumes'){const note=api.illustrationNote(c,film);if(note)body+='<h4>Illustration note</h4>'+text(note);}
 if(!body)return;
 const section=document.createElement('section');section.className='body-section reader-module cv-friday-sequel1059';section.dataset.fridaySequel1059=film;section.innerHTML='<div class="section-kicker">SEPARATE FILM CONTINUATION · SPOILERS</div><h3>Friday the 13th Part 2 (1981)</h3>'+body+'<details class="cv-film-sources1046"><summary>Sources for this film account</summary>'+sources(s.sourceIds||snap.sourceIds||[])+'</details>';host.append(section);
};
api.relationshipStory=(base,key)=>{
 const extras=list(api.data?.historySupplements?.[key]);if(!extras.length)return base;
 const stories=[base,...extras].filter(Boolean);return {...base,title:base?.title||extras[0].title,connections:stories.flatMap(s=>list(s.connections)),evidenceNote:'Each film’s researched events remain labeled. Original 1980 evidence is preserved; Part 2 material is a separate continuation.',continuity:'Original-series films, separately labeled: Friday the 13th (1980) and Part 2 (1981)',summary:stories.flatMap(s=>['['+(s.sourceFilmId===film?'Part 2 · 1981':'Original film · 1980')+']',...list(s.summary)]),timeline:stories.flatMap(s=>list(s.timeline).map(t=>({...t,title:(s.sourceFilmId===film?'Part 2 · ':'1980 · ')+(t.title||'')}))),sources:Object.assign({},...stories.map(s=>s.sources||{})),limits:stories.flatMap(s=>list(s.limits)),status:extras.at(-1).status||base?.status};
};
api.originalStillMarkup=(cls,choice)=>'<picture class="'+esc(cls)+' cv-original-film-still1050" data-art-slug="friday13-jason" data-original-still1050><img src="assets/characters/'+esc(choice?.file||'friday13-jason')+'.webp" width="423" height="396" alt="Child Jason in the original Friday the 13th (1980) film still" loading="'+(String(cls).includes('card-character-image')?'lazy':'eager')+'" decoding="async" onerror="this.onerror=null;window.ComicVaultArtworkPlaceholder.show(this.closest(\'picture\'),this)"></picture>';
api.graphArtwork=(c,filmId)=>{if(suppliedArtwork[c?.imageSlug])return '<span class="cvx-node-art">'+api.suppliedMarkup(suppliedArtwork[c.imageSlug],'')+'</span>';if(originalMedia[c?.imageSlug])return '<span class="cvx-node-art">'+api.stillMarkup(originalMedia[c.imageSlug],'')+'</span>';const cfg=window.ComicVaultFilmCatalog1050?.portraitVariantConfigs?.[c?.imageSlug];if(c?.publisher!=='FRIDAY13'||!cfg)return '';const context=window.ComicVaultSlideshowBridge1051?.context?.();const id=filmId||(context?.profileOpen?context.activeFilmId:context?.filmId);const p=cfg.choices.find(x=>x.filmId===id)||cfg.choices[0];return '<span class="cvx-node-art" '+window.ComicVaultArtworkPlaceholder.attributes(c,true)+'><picture><img src="assets/characters/'+esc(p.file)+'.'+esc(p.ext||'webp')+'" data-cvx-art="'+esc(p.file)+'" alt="'+esc(p.alt||c.name)+'" width="'+(p.originalStill?423:120)+'" height="'+(p.originalStill?396:160)+'" loading="lazy" decoding="async"></picture></span>';};
const originalMedia={};
const suppliedArtwork={"friday13-terry":{filmId:film,file:"friday13-terry",ext:"png",width:848,height:1264,alt:"User-supplied transparent Terry artwork for Friday the 13th Part 2",note:"User-supplied artwork · exact transparent PNG, not a film still."}};
api.suppliedArtwork=suppliedArtwork;
api.suppliedMarkup=(media,cls)=>'<picture class="'+esc(cls)+'" data-art-slug="'+esc(media.file)+'" data-user-supplied-artwork1059><img src="assets/characters/'+esc(media.file)+'.'+esc(media.ext)+'" width="'+media.width+'" height="'+media.height+'" alt="'+esc(media.alt)+'" loading="'+(String(cls).includes('card-character-image')?'lazy':'eager')+'" decoding="async" onerror="this.onerror=null;window.ComicVaultArtworkPlaceholder.show(this.closest(\'picture\'),this)"></picture>';
api.originalMedia=originalMedia;
api.stillMarkup=(media,cls)=>'<picture class="'+esc(cls)+' cv-original-film-still1059" data-art-slug="'+esc(media.file)+'" data-original-still1059 style="--cv-still-width:'+media.width+'px;--cv-still-height:'+media.height+'px"><img src="assets/characters/'+esc(media.file)+'.'+esc(media.ext)+'" width="'+media.width+'" height="'+media.height+'" alt="'+esc(media.alt)+'" loading="'+(String(cls).includes('card-character-image')?'lazy':'eager')+'" decoding="async" onerror="this.onerror=null;window.ComicVaultArtworkPlaceholder.show(this.closest(\'picture\'),this)"></picture>';
api.artworkFor=(c,cls)=>suppliedArtwork[c?.imageSlug]?api.suppliedMarkup(suppliedArtwork[c.imageSlug],cls):originalMedia[c?.imageSlug]?api.stillMarkup(originalMedia[c.imageSlug],cls):'';
api.illustrationNote=(c,id)=>{const media=originalMedia[c?.imageSlug];if(media&&id===media.filmId)return media.note;if(id!==film)return c?.portraitProvenance?.note||'';const note=api.data?.portraitVariantProvenance?.[c?.imageSlug]?.[id]?.note;return note||((c?.sourceFilmId===id)?c?.portraitProvenance?.note:'A separate illustration represents this film appearance. Any reconstructed details are illustration choices, not additional film evidence.')||'';};
api.ready=true;
})();
