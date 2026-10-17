/* Comic Vault 10.51: independent character slideshow. Read-only catalog; no artwork/data/storage mutations. */
(() => {
'use strict';
if (window.ComicVaultSlideshow1051) return;
const VERSION='10.51', INTERVAL=8000;
const universeNames={ALL:'All universes',DC:'DC',MARVEL:'Marvel',BUFFYVERSE:'Buffyverse',SUPERNATURAL:'Supernatural',CHARMED:'Charmed',GRIMM:'Grimm',HALLOWEEN:'Halloween',FRIDAY13:'Friday the 13th'};
const $=id=>document.getElementById(id);
const bridge=()=>window.ComicVaultSlideshowBridge1051;
const catalog=()=>window.ComicVaultFilmCatalog1050||{};
const movies=()=>window.ComicVaultFilmDetails1050?.movies||{};
const records=()=>Array.isArray(window.COMIC_VAULT_CHARACTERS)?window.COMIC_VAULT_CHARACTERS:[];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
const cut=(value,n=170)=>{const s=clean(value);if(s.length<=n)return s;const p=s.slice(0,n-1).lastIndexOf(' ');return s.slice(0,p>n/2?p:n-1)+'…';};
const filmLabel=id=>clean(movies()[id]?.title)||id;
const validFilm=id=>typeof id==='string'&&Object.hasOwn(movies(),id);
const appearance=(c,id)=>(catalog().filmAppearanceCatalog?.filmAppearances?.[c.imageSlug]||[]).find(a=>a.filmId===id);
const canonicalList=list=>{const seen=new Set;return (Array.isArray(list)?list:[]).filter(c=>c&&typeof c.imageSlug==='string'&&!seen.has(c.imageSlug)&&seen.add(c.imageSlug));};
const sorted=list=>canonicalList(list).slice().sort((a,b)=>a.name.localeCompare(b.name));
/* These are deliberately basic, spoiler-safe descriptions, not truncated plot synopses. */
const safeBasics={
 'friday13-alice':['Camp counselor · Aspiring artist','Helping Steve Christy prepare Camp Crystal Lake for its reopening.'],
 'friday13-mrs-voorhees':['Former camp cook','A woman with a personal connection to Camp Crystal Lake and its past.'],
 'friday13-jason':['Child associated with Camp Crystal Lake','The young Jason connected to the camp’s history in the original 1980 film.'],
 'friday13-annie':['Incoming camp cook','A new arrival traveling to Crystal Lake to take a job in the camp kitchen.'],
 'friday13-jack':['Camp counselor','Part of the young crew helping prepare Camp Crystal Lake for the summer.'],
 'friday13-marcie':['Camp counselor','Arrives at Camp Crystal Lake with Jack and Ned to help with the reopening.'],
 'friday13-bill':['Camp counselor · Maintenance helper','Works alongside the other counselors as they get Crystal Lake ready.'],
 'friday13-brenda':['Camp counselor','Helps prepare the camp and its activity areas for the returning campers.'],
 'friday13-ned':['Camp counselor','A playful member of the crew getting Camp Crystal Lake ready to reopen.'],
 'friday13-steve-christy':['Camp owner','Organizes the repairs and recruits the staff for Crystal Lake’s reopening.'],
 'friday13-crazy-ralph':['Local resident','A familiar figure around town who warns newcomers about Camp Crystal Lake.'],
 'friday13-officer-dorf':['Motorcycle police officer','A local officer whose patrol brings him to the camp.'],
 'friday13-sgt-tierney':['Police sergeant','A police officer from the area around Camp Crystal Lake.'],
 'friday13-enos':['Truck driver','A local driver familiar with the roads and stories surrounding Crystal Lake.'],
 'friday13-barry':['Camp counselor · 1958','One of the counselors at Camp Crystal Lake in the film’s opening period.'],
 'friday13-claudette':['Camp counselor · 1958','One of the counselors at Camp Crystal Lake in the film’s opening period.'],
 'halloween-michael-myers':['The Shape','A masked figure whose presence threatens the ordinary routines of Haddonfield.'],
 'halloween-sam-loomis':['Psychiatrist','A doctor closely involved with Michael Myers and the search for him.'],
 'halloween-laurie-strode':['Haddonfield resident','A central figure in the Haddonfield story. This view keeps later developments out of the overview.'],
 'halloween-laurie-strode-2007-remake':['Student · Babysitter','A Haddonfield teenager spending Halloween with friends and babysitting responsibilities.'],
 'halloween-michael-myers-2007-remake':['Michael Myers','The Michael Myers of Rob Zombie’s 2007 reimagining of Halloween.'],
 'halloween-sam-loomis-2007-remake':['Psychiatrist','Michael Myers’s psychiatrist in the 2007 reimagining of Halloween.'],
 'halloween-laurie-strode-2009-remake':['Haddonfield resident','Laurie Strode in Rob Zombie’s Halloween II (2009), a separate view from the earlier film.']
};
const unsafeRole=/\b(kill(?:er|ing|ed|s)?|murder(?:er|ed|s)?|attacker|survivor|victim|dead|death|dies|died|resurrect|revealed|secret|dream|ghost|afterlife|possess|betray|finale|unmasked|body-only|corpse|impersonat)\b/i;
function basics(c,filmId){
 const sameBaseline=!filmId||c.sourceFilmId===filmId;
 const known=safeBasics[c.imageSlug];
 // Cross-film fields may describe a different era. Do not use them as selected-film facts.
 if(known&&sameBaseline)return {role:known[0],summary:known[1]};
 const explicit=filmId?c.slideshowByFilm?.[filmId]:c.slideshowBasics;
 if(explicit?.spoilerSafe===true)return {role:cut(explicit.role||'Character',100),summary:cut(explicit.summary,230)};
 let role=sameBaseline?clean(c.occupation):'';
 role=role.split(/;|\n/).filter(p=>!unsafeRole.test(p)).join(' · ');
 if(!role||unsafeRole.test(role))role=filmId?'Film character':c.mediaType==='television'?'Television character':'Character';
 role=cut(role,95);
 if(filmId)return {role,summary:'Featured in '+filmLabel(filmId)+'. The full dossier contains the detailed film account.'};
 const universe=universeNames[c.publisher]||c.publisher||'Comic Vault';
 const species=clean(c.species);
 const lead=species&&species.length<45&&!unsafeRole.test(species)?species+' · ':'';
 return {role,summary:lead+'Part of the '+universe+' archive. Open the full dossier for background, abilities and relationships.'};
}
function portrait(c,filmId){
 const revisions=window.ComicVaultTransport10501?.assetRevisions||{};
 const suffix=file=>revisions[file]||(file==='halloween-john-tate'?'?v=10.50':'');
 const cfg=catalog().portraitVariantConfigs?.[c.imageSlug];
 const p=filmId?cfg?.choices?.find(x=>x.filmId===filmId):cfg?.choices?.[0];
 if(['halloween-shirl-jones','halloween-cop-1-h20','halloween-cop-2-h20'].includes(c.imageSlug))return {missing:true,note:c.imageSlug==='halloween-shirl-jones'?'Voice-only character. No on-screen likeness.':'A verified film likeness is not available.'};
 if(c.imageSlug==='friday13-jason')return {src:'assets/characters/friday13-jason.webp',alt:'Child Jason in the original Friday the 13th (1980) film still',original:true,note:'Original 1980 film still · displayed without enlargement.'};
 if(filmId&&!p&&c.sourceFilmId!==filmId)return {missing:true,note:'A portrait specific to this film is not available. Other-era artwork is not substituted.'};
 if(p){const ext=p.ext||'webp';return {src:'assets/characters/'+p.file+'.'+ext+suffix(p.file),fallback:ext==='webp'?'assets/characters/'+p.file+'.png'+suffix(p.file):null,alt:p.alt||c.name+' · '+(filmId?filmLabel(filmId):'portrait'),note:/reus|reference|existing|same artwork/i.test(p.detail||'')?cut(p.detail,180):''};}
 if(!filmId&&window.ComicVaultFormPortraits?.has(c.imageSlug))return {markup:window.ComicVaultFormPortraits.markup(c.imageSlug,'cvss-form-source'),note:''};
 const file=c.imageSlug;return {src:'assets/characters/'+file+'.webp'+suffix(file),fallback:'assets/characters/'+file+'.png'+suffix(file),alt:c.name+' portrait',note:''};
}
let dialog,scopePanel,main,returnBar,ready=false;
let active=false,dossier=false,suppressClose=false,origin=null,originFocus=null,originOverflow='',filteredSnapshot=[],filterFilm='',scope={kind:'filters',value:''},list=[],index=0,timer=0,playing=false,pointer=null;
const visible=()=>!!dialog?.open&&!dialog.hidden&&!document.hidden&&getComputedStyle(dialog).display!=='none'&&getComputedStyle(dialog).visibility!=='hidden';
const current=()=>list[index]||null;
function listFor(next){
 if(next.kind==='movie')return sorted(records().filter(c=>appearance(c,next.value)?.defaultCastFilter===true));
 if(next.kind==='universe')return sorted(records().filter(c=>next.value==='ALL'||c.publisher===next.value));
 return filteredSnapshot.slice();
}
function activeFilm(){return scope.kind==='movie'?scope.value:scope.kind==='filters'?filterFilm:'';}
function scopeText(){return scope.kind==='movie'?filmLabel(scope.value):scope.kind==='universe'?(universeNames[scope.value]||scope.value):'Current filtered results';}
function status(message){const el=$('cvSlideshowStatus1051');if(el)el.textContent=message;}
function pause(announce=false){if(timer)window.clearTimeout(timer);timer=0;const was=playing;playing=false;paintControls();if(announce&&was)status('Slideshow paused.');}
function paintControls(){if(!dialog)return;const count=list.length;
 const prev=dialog.querySelector('[data-cvss-action="previous"]'),next=dialog.querySelector('[data-cvss-action="next"]'),playBtn=dialog.querySelector('[data-cvss-action="play"]'),full=dialog.querySelector('[data-cvss-action="dossier"]');
 prev.disabled=count<2||index===0;next.disabled=count<2||index>=count-1;playBtn.disabled=count<2;full.disabled=!count;
 playBtn.textContent=playing?'Ⅱ Pause':index===count-1&&count>1?'▶ Replay':'▶ Play slideshow';playBtn.setAttribute('aria-pressed',String(playing));playBtn.setAttribute('aria-label',playing?'Pause slideshow':index===count-1&&count>1?'Replay slideshow from the beginning':'Play slideshow, one character every eight seconds');
 $('cvSlideshowPlayNote1051').textContent=playing?'Playing · changes every 8 seconds':count<2?'Autoplay needs at least two characters':'Autoplay is off · press Play to start';
}
function schedule(){if(timer)window.clearTimeout(timer);timer=window.setTimeout(()=>{timer=0;if(!playing||!visible()||!scopePanel.hidden){pause();return;}if(index>=list.length-1){pause(true);return;}index++;render();if(index>=list.length-1){pause();status('End of slideshow. '+current().name+'.');}else schedule();},INTERVAL);}
function play(){if(!active||!visible()||!scopePanel.hidden||list.length<2)return false;if(index>=list.length-1){index=0;render();}playing=true;paintControls();status('Slideshow playing. Changes every eight seconds.');schedule();return true;}
function move(delta){if(!active||dossier||!scopePanel.hidden)return false;pause();const target=Math.max(0,Math.min(list.length-1,index+delta));if(target===index)return false;index=target;render();return true;}
function handleImage(img,p,fallbackNode){let attempted=false;img.onerror=()=>{if(p.fallback&&!attempted){attempted=true;img.src=p.fallback;return;}img.onerror=null;img.hidden=true;img.style.setProperty('display','none','important');fallbackNode.hidden=false;};}
function render(){
 if(!dialog)return;const c=current();
 $('cvSlideshowScopeLabel1051').textContent=scope.kind==='movie'?'Movie':scope.kind==='universe'?'Universe':'Current filters';
 $('cvSlideshowScopeValue1051').textContent=scopeText();$('cvSlideshowScopeCount1051').textContent=list.length+' character'+(list.length===1?'':'s');
 const card=$('cvSlideshowCard1051'),empty=$('cvSlideshowEmpty1051');card.hidden=!c;empty.hidden=!!c;
 if(c){const p=portrait(c,activeFilm()),b=basics(c,activeFilm()),art=$('cvSlideshowArt1051');
  art.replaceChildren();art.classList.toggle('cvss-original-still',!!p.original);
  const count=document.createElement('span');count.className='cvss-position';count.textContent=(index+1)+' / '+list.length;count.setAttribute('aria-hidden','true');art.append(count);
  const fallback=document.createElement('div');fallback.className='cvss-fallback';fallback.innerHTML='<strong>'+esc(c.name)+'</strong><span>Portrait unavailable</span>';fallback.hidden=!p.missing;art.append(fallback);
  if(!p.missing){let img;if(p.markup){const t=document.createElement('template');t.innerHTML=p.markup;const source=t.content.querySelector('img');if(source){img=document.createElement('img');img.src=source.getAttribute('src');img.alt=source.getAttribute('alt')||c.name+' portrait';p.fallback=source.dataset.pngFallback;}}else{img=document.createElement('img');img.src=p.src;img.alt=p.alt||c.name+' portrait';}
   if(img){img.draggable=false;img.decoding='async';if(p.original){img.width=423;img.height=396;}handleImage(img,p,fallback);art.append(img);}else fallback.hidden=false;
  }
  $('cvSlideshowArtNote1051').textContent=p.note||'';$('cvSlideshowArtNote1051').hidden=!p.note;
  $('cvSlideshowName1051').textContent=c.name;$('cvSlideshowRole1051').textContent=b.role;$('cvSlideshowSummary1051').textContent=b.summary;
  $('cvSlideshowSwipe1051').hidden=list.length<2;
  status(c.name+'. Character '+(index+1)+' of '+list.length+'.');
 }else status('No characters match this slideshow. Choose another scope.');
 paintControls();
}
function showDialog(){suppressClose=false;if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.setAttribute('aria-modal','true');}}document.body.style.overflow='hidden';}
function hideDialog(){pause();suppressClose=true;if(dialog.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}document.body.style.overflow=originOverflow;}
function restoreOrigin(){if(origin&&bridge()?.restoreEntry)bridge().restoreEntry(origin);else if(dossier)bridge()?.closeDossier?.();}
function finish({restore=true,focus=true}={}){
 if(!active&&!dossier)return;pause();active=false;const hadDossier=dossier;dossier=false;setScopeOpen(false,false);hideDialog();returnBar.hidden=true;
 if(restore)restoreOrigin();else if(hadDossier)bridge()?.closeDossier?.();
 origin=null;filteredSnapshot=[];list=[];index=0;pointer=null;
 if(focus&&originFocus?.isConnected)originFocus.focus({preventScroll:true});originFocus=null;
}
function open(options={}){
 if(!ready||!bridge())return false;
 if(active){if(dossier)resume();return true;}
 const ctx=bridge().context();origin=bridge().captureEntry?.()||null;originFocus=document.activeElement;originOverflow=document.body.style.overflow;
 filteredSnapshot=canonicalList(bridge().filtered());filterFilm=validFilm(ctx.filmId)?ctx.filmId:'';
 const initialFilm=ctx.profileOpen&&validFilm(ctx.activeFilmId)?ctx.activeFilmId:filterFilm;
 let next=options.kind?{kind:options.kind,value:options.value||''}:initialFilm?{kind:'movie',value:initialFilm}:{kind:'filters',value:''};
 if(!['movie','universe','filters'].includes(next.kind))next={kind:'filters',value:''};
 if(next.kind==='movie'&&!validFilm(next.value))next={kind:'filters',value:''};
 if(ctx.profileOpen&&!initialFilm&&!options.kind&&!filteredSnapshot.some(c=>c.imageSlug===ctx.activeSlug)){const c=records().find(c=>c.imageSlug===ctx.activeSlug);next={kind:'universe',value:c?.publisher||ctx.publisher||'ALL'};}
 scope=next;list=listFor(scope);index=Math.max(0,list.findIndex(c=>c.imageSlug===(options.slug||ctx.profileOpen&&ctx.activeSlug)));active=true;dossier=false;playing=false;returnBar.hidden=true;
 render();setScopeOpen(false,false);showDialog();main.scrollTop=0;dialog.querySelector('[data-cvss-action="close"]').focus({preventScroll:true});return true;
}
function selectScope(kind,value=''){
 if(!active||!['movie','universe','filters'].includes(kind)||kind==='movie'&&!validFilm(value))return false;
 pause();const slug=current()?.imageSlug;scope={kind,value};list=listFor(scope);index=Math.max(0,list.findIndex(c=>c.imageSlug===slug));render();main.scrollTop=0;return true;
}
function setScopeOpen(value,focus=true){
 if(!scopePanel)return;if(value){pause();populateScope();scopePanel.hidden=false;dialog.querySelectorAll('.cvss-header,.cvss-main,.cvss-controls').forEach(n=>n.inert=true);if(focus)scopePanel.querySelector('input:checked')?.focus({preventScroll:true});}
 else {scopePanel.hidden=true;dialog.querySelectorAll('.cvss-header,.cvss-main,.cvss-controls').forEach(n=>n.inert=false);if(focus&&dialog.open)dialog.querySelector('[data-cvss-action="scope"]').focus({preventScroll:true});}
}
function scopeDraft(){const kind=scopePanel.querySelector('input[name="cvss-mode"]:checked')?.value||'filters';return {kind,value:kind==='movie'?$('cvSlideshowMovie1051').value:kind==='universe'?$('cvSlideshowUniverse1051').value:''};}
function updateDraft(){const draft=scopeDraft();scopePanel.querySelectorAll('select').forEach(el=>el.disabled=el.dataset.cvssMode!==draft.kind);const count=listFor(draft).length;$('cvSlideshowApply1051').textContent='Browse '+count+' character'+(count===1?'':'s');}
function populateScope(){
 const films=Object.keys(movies());$('cvSlideshowMovie1051').innerHTML=films.map(id=>'<option value="'+esc(id)+'">'+esc(filmLabel(id))+'</option>').join('');
 const pubs=['ALL',...new Set(records().map(c=>c.publisher).filter(Boolean))];$('cvSlideshowUniverse1051').innerHTML=pubs.map(p=>'<option value="'+esc(p)+'">'+esc(universeNames[p]||p)+'</option>').join('');
 $('cvSlideshowMovie1051').value=validFilm(scope.value)?scope.value:validFilm(filterFilm)?filterFilm:films[0]||'';
 const pub=current()?.publisher||bridge().context().publisher||'ALL';$('cvSlideshowUniverse1051').value=scope.kind==='universe'?scope.value:pub;
 scopePanel.querySelectorAll('input[name="cvss-mode"]').forEach(r=>r.checked=r.value===scope.kind);updateDraft();
}
function openDossier(){
 const c=current();if(!c||!active||dossier)return false;pause();setScopeOpen(false,false);dossier=true;hideDialog();
 try{bridge().openDossier(c.imageSlug,activeFilm()||null);}catch(error){dossier=false;showDialog();status('The dossier could not be opened.');console.error(error);return false;}
 returnBar.hidden=false;returnBar.querySelector('span').textContent='Paused at '+c.name+' · '+(index+1)+' of '+list.length;returnBar.querySelector('button').focus({preventScroll:true});return true;
}
function resume(){
 if(!active||!dossier)return false;dossier=false;returnBar.hidden=true;bridge()?.restoreEntry?.(origin);render();showDialog();dialog.querySelector('[data-cvss-action="dossier"]').focus({preventScroll:true});return true;
}
function keydown(event){
 if(!active||dossier||!dialog.open)return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!scopePanel.hidden)setScopeOpen(false);else finish();return;}
 if(event.key==='Tab'){
  const root=scopePanel.hidden?dialog:scopePanel;const targets=[...root.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(n=>!n.closest('[hidden]')&&!n.closest('[inert]'));const first=targets[0],last=targets[targets.length-1];
  if(first&&((event.shiftKey&&document.activeElement===first)||!root.contains(document.activeElement))){event.preventDefault();(event.shiftKey?last:first).focus();}
  else if(last&&!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}return;
 }
 if(!scopePanel.hidden||event.altKey||event.ctrlKey||event.metaKey||/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName))return;
 if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Home'){pause();index=0;render();}else if(event.key==='End'){pause();index=Math.max(0,list.length-1);render();}else move(event.key==='ArrowRight'?1:-1);}
}
function boot(){
 if(ready||!bridge()||!$('archive')||!$('profileSheet'))return;
 dialog=document.createElement('dialog');dialog.id='cvSlideshow1051';dialog.setAttribute('aria-labelledby','cvSlideshowTitle1051');dialog.setAttribute('aria-modal','true');
 dialog.innerHTML='<div class="cvss-shell"><header class="cvss-header"><div class="cvss-brand"><span class="cvss-logo" aria-hidden="true">CV</span><span><strong>COMIC VAULT</strong><small>THE CHARACTER ARCHIVE</small></span></div><button type="button" class="cvss-close" data-cvss-action="close" aria-label="Close character slideshow">×</button></header><main class="cvss-main"><h1 id="cvSlideshowTitle1051" class="cvss-title">Character slideshow</h1><button type="button" class="cvss-scope-button" data-cvss-action="scope" aria-haspopup="dialog" aria-controls="cvSlideshowScope1051"><span class="cvss-scope-label" id="cvSlideshowScopeLabel1051"></span><span class="cvss-scope-count" id="cvSlideshowScopeCount1051"></span><span class="cvss-scope-value" id="cvSlideshowScopeValue1051"></span><span class="cvss-chevron" aria-hidden="true">›</span></button><article id="cvSlideshowCard1051" class="cvss-card" aria-labelledby="cvSlideshowName1051"><div id="cvSlideshowArt1051" class="cvss-art"></div><p id="cvSlideshowArtNote1051" class="cvss-art-note" hidden></p><p id="cvSlideshowSwipe1051" class="cvss-swipe">← &nbsp; Swipe to browse &nbsp; →</p><h2 id="cvSlideshowName1051" class="cvss-name"></h2><p id="cvSlideshowRole1051" class="cvss-role"></p><p id="cvSlideshowSummary1051" class="cvss-summary"></p><p class="cvss-safe">◇ &nbsp; Spoiler-safe basics</p></article><div id="cvSlideshowEmpty1051" class="cvss-empty" hidden><h3>No characters in this view</h3><p>Choose another movie, universe or set of filters to begin.</p><button type="button" class="cvss-primary" data-cvss-action="scope">Choose a slideshow</button></div></main><footer class="cvss-controls"><div class="cvss-nav" role="group" aria-label="Slideshow controls"><button type="button" data-cvss-action="previous" aria-label="Previous character">‹ &nbsp; Previous</button><button type="button" data-cvss-action="play" aria-pressed="false">▶ Play slideshow</button><button type="button" data-cvss-action="next" aria-label="Next character">Next &nbsp; ›</button></div><button type="button" class="cvss-primary" data-cvss-action="dossier">Open full dossier &nbsp; ›</button><p id="cvSlideshowPlayNote1051" class="cvss-play-note"></p></footer></div><section id="cvSlideshowScope1051" class="cvss-scope-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="cvSlideshowScopeTitle1051"><form class="cvss-scope-panel"><div class="cvss-scope-heading"><h2 id="cvSlideshowScopeTitle1051">Choose your slideshow</h2><button type="button" class="cvss-close" data-cvss-action="scope-close" aria-label="Cancel scope selection">×</button></div><p>Browse only the characters you pick.</p><fieldset class="cvss-options"><legend class="cvss-sr">Slideshow scope</legend><div class="cvss-option"><label><input type="radio" name="cvss-mode" value="movie"><span>A movie<small>Keep one film and continuity together.</small></span></label><label class="cvss-sr" for="cvSlideshowMovie1051">Choose a movie</label><select id="cvSlideshowMovie1051" data-cvss-mode="movie"></select></div><div class="cvss-option"><label><input type="radio" name="cvss-mode" value="universe"><span>A universe<small>Choose a world from your archive.</small></span></label><label class="cvss-sr" for="cvSlideshowUniverse1051">Choose a universe</label><select id="cvSlideshowUniverse1051" data-cvss-mode="universe"></select></div><div class="cvss-option"><label><input type="radio" name="cvss-mode" value="filters"><span>Current filters<small>Use the exact results from your archive.</small></span></label></div></fieldset><p>Autoplay stays off until you press Play.</p><button type="submit" class="cvss-primary" id="cvSlideshowApply1051">Browse characters</button></form></section><span id="cvSlideshowStatus1051" class="cvss-sr" role="status" aria-live="polite" aria-atomic="true"></span>';
 document.body.append(dialog);main=dialog.querySelector('.cvss-main');scopePanel=$('cvSlideshowScope1051');
 const archiveButton=document.createElement('button');archiveButton.type='button';archiveButton.id='cvSlideshowArchiveEntry1051';archiveButton.className='cv-slideshow-entry1051';archiveButton.textContent='▶ Character slideshow';archiveButton.addEventListener('click',()=>open());const intro=$('archive').querySelector('.archive-intro');(intro||$('archive')).append(archiveButton);
 const profileButton=document.createElement('button');profileButton.type='button';profileButton.id='cvSlideshowProfileEntry1051';profileButton.className='cv-slideshow-entry1051';profileButton.textContent='▶ Browse characters in a slideshow';profileButton.addEventListener('click',()=>open());$('profileFacts').before(profileButton);
 returnBar=document.createElement('div');returnBar.id='cvSlideshowReturn1051';returnBar.hidden=true;returnBar.innerHTML='<button type="button" class="cv-slideshow-return1051">‹ Return to slideshow</button><span></span>';$('profileFacts').before(returnBar);returnBar.querySelector('button').addEventListener('click',resume);
 dialog.addEventListener('click',event=>{const action=event.target.closest('[data-cvss-action]')?.dataset.cvssAction;if(!action)return;event.preventDefault();if(action==='close')finish();else if(action==='scope')setScopeOpen(true);else if(action==='scope-close')setScopeOpen(false);else if(action==='previous')move(-1);else if(action==='next')move(1);else if(action==='play'){if(playing)pause(true);else play();}else if(action==='dossier')openDossier();});
 scopePanel.addEventListener('change',updateDraft);scopePanel.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const draft=scopeDraft();selectScope(draft.kind,draft.value);setScopeOpen(false);});
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!scopePanel.hidden)setScopeOpen(false);else finish();});dialog.addEventListener('close',()=>{if(dialog.open)return;pause();if(!suppressClose&&active)finish();});
 window.addEventListener('keydown',keydown,true);
 const swipeArea=$('cvSlideshowCard1051');swipeArea.addEventListener('pointerdown',event=>{if(event.isPrimary===false){pointer=null;return;}if(event.button>0||event.target.closest('button,a,input,select'))return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,time:Date.now()};},{passive:true});
 swipeArea.addEventListener('pointerup',event=>{if(!pointer||event.pointerId!==pointer.id)return;const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y,ms=Date.now()-pointer.time;pointer=null;if(ms<1200&&Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);},{passive:true});swipeArea.addEventListener('pointercancel',()=>{pointer=null;},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',()=>pause());window.addEventListener('blur',()=>pause());
 new MutationObserver(()=>{if(active&&!visible())pause();}).observe(dialog,{attributes:true,attributeFilter:['open','hidden','style']});
 new MutationObserver(()=>{if(active&&dossier&&!$('profileSheet').classList.contains('open'))resume();}).observe($('profileSheet'),{attributes:true,attributeFilter:['class']});
 // Preserve native page/history handling. A browser navigation dismisses this overlay, never reopens it.
 window.addEventListener('popstate',()=>{if(active){pause();if(!dossier)finish({restore:false,focus:false});else{dossier=false;active=false;returnBar.hidden=true;origin=null;}}},true);
 ready=true;
}
window.ComicVaultSlideshow1051=Object.freeze({version:VERSION,open,close:()=>finish(),state:()=>({ready,open:!!dialog?.open,active,dossier,playing,index,count:list.length,slug:current()?.imageSlug||null,scope:{...scope},filmId:activeFilm()||null}),selectScope,next:()=>move(1),previous:()=>move(-1),play,pause:()=>pause(true),openDossier,resume,inspect:(slug,filmId='')=>{const c=records().find(c=>c.imageSlug===slug);return c?{basics:basics(c,filmId),portrait:portrait(c,filmId)}:null;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
