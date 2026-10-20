/* Film-scoped presentation without rewriting the original dossiers. */
(()=>{'use strict';
const api=window.ComicVaultHalloweenKills1062;if(!api?.integrated)return;
const F=api.filmId,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=x=>Array.isArray(x)?x:x?[x]:[];
const text=x=>list(x).map(p=>'<p>'+esc(typeof p==='string'?p:p.detail||p.text||'')+'</p>').join('');
api.displayName=(c,filmId)=>filmId===F?(api.data.displayNames[c?.imageSlug]||c?.name):c?.name;
api.aliasSearchScore=(c,q)=>c?.imageSlug==='halloween-cemetery-caretaker-2018'&&/sondra/i.test(q)?100:0;
api.castBadge=(c,filmId)=>filmId===F&&['halloween-marcus-kills','halloween-vanessa-kills','halloween-tivoli-kills'].includes(c?.imageSlug)?'RETURNING CHARACTER · FIRST SEEN IN 2018':'';
api.appearanceLabel=r=>r?.filmId===F?({'television-interview':'TELEVISION INTERVIEW','corpse-and-recorded-voicemail':'BODY / RECORDED VOICEMAIL','news-broadcast-photograph':'PHOTOGRAPH ONLY','archive-corpse-and-photograph':'ARCHIVAL / PHOTOGRAPH'})[r.appearanceSubtype]||'':'';
api.updateProfileName=(c,filmId)=>{const n=document.getElementById('profileName');if(n&&c)n.textContent=api.displayName(c,filmId).toUpperCase();};
api.pendingArtworkMarkup=(c,cls='character-image')=>c?.photoPending?'<div class="cv-voice-only-art1043 '+esc(cls)+'" data-photo-pending="true" role="img" aria-label="'+esc(c.name)+': photo pending"><span>PHOTO PENDING<br><small>Dossier available · portrait to be added</small></span></div>':'';
api.appendHistory=(host,c,tab,state)=>{
 if(c?.publisher!=='HALLOWEEN'||!state.fullHistory||c.sourceFilmId===F)return;
 const snap=api.data.movieDetails.characterSnapshots[c.imageSlug]?.[F];if(!snap)return;
 let body='';
 if(tab==='history')body=text(snap.background)+text(snap.role)+text(snap.status);
 else if(tab==='powers')body=text(snap.abilities);
 else if(tab==='gear')body=text(snap.gear);
 else if(tab==='costumes')body=text(snap.costume);
 else if(tab==='comics')body='<p>This account covers Halloween Kills, a direct sequel to the 1978 film. It does not inherit the sibling revelation or the remake histories.</p><button type="button" data-cv-movie-info1046="'+F+'">Open the Kills movie dossier</button>';
 else if(tab==='allies'||tab==='enemies')body=list(snap.relationships).filter(r=>{return r.relationshipClass===(tab==='enemies'?'hostile':'friendly');}).map(r=>'<article><h4><button type="button" data-cv-film-character1046="'+esc(r.slug)+'" data-cv-film1046="'+F+'">'+esc(r.name)+'</button></h4>'+text(r.detail)+'</article>').join('');
 if(!body)return;
 const section=document.createElement('section');section.className='body-section reader-module';section.dataset.halloweenKillsSupplement=F;
 const ids=new Set(snap.sourceIds||[]);const sources=[...ids].map(id=>api.data.graph.sources[id]).filter(Boolean);
 section.innerHTML='<div class="section-kicker">2018 CONTINUITY · FILM-SPECIFIC ACCOUNT · SPOILERS</div><h3>Halloween Kills</h3><p>This section stops at the theatrical ending of Kills. Other timeline branches and later films remain separately labeled.</p>'+body+'<details class="cv-film-sources1046"><summary>Sources for this film account</summary><ul>'+sources.map(s=>'<li>'+(/^https?:\/\//.test(s.url||'')?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.label||s.id)+'</a>':esc(s.title||s.label||s.id))+'</li>').join('')+'</ul></details>';
 host.append(section);
};
api.graphArtwork=(c,filmId)=>{
 if(c?.photoPending)return '<span class="cvx-node-art cvx-art-missing" data-photo-pending="true" role="img" aria-label="'+esc(c.name)+': photo pending"><span style="font-size:11px;text-align:center">PHOTO PENDING</span></span>'; 
 if(c?.publisher!=='HALLOWEEN'||filmId!==F)return '';
 const cfg=window.ComicVaultFilmCatalog1050?.portraitVariantConfigs?.[c.imageSlug];const choice=cfg?.choices?.find(x=>x.filmId===F);if(!choice)return '';
 return '<span class="cvx-node-art" '+window.ComicVaultArtworkPlaceholder.attributes(c,true)+'><picture><img src="assets/characters/'+esc(choice.file)+'.'+esc(choice.ext||'webp')+'" data-cvx-art="'+esc(choice.file)+'" alt="'+esc(choice.alt||c.name)+'" width="120" height="160" loading="lazy" decoding="async"></picture></span>';
};
api.relationshipStory=(base,key)=>{
 const extra=api.data.historySupplements?.[key];if(!extra)return base;
 const stories=[base,...list(extra)].filter(Boolean);
 return {...base,title:base?.title||stories.at(-1).title,continuity:'Separately labeled film continuities; the 2018 account continues only Halloween (1978).',summary:stories.flatMap(s=>[s.sourceFilmId===F?'Halloween Kills · Direct 1978 sequel':'Previously researched film account',...list(s.summary)]),timeline:stories.flatMap(s=>list(s.timeline)),connections:stories.flatMap(s=>list(s.connections)),sources:Object.assign({},...stories.map(s=>s.sources||{})),evidenceNote:'Do not combine incompatible family relationships or events across continuity branches.'};
};
})();
