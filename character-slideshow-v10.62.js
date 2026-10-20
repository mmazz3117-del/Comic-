/* Comic Vault 10.54: no-repeat shuffle and playing-only immersive auto-hide; read-only catalog. */
(() => {
'use strict';
if (window.ComicVaultSlideshow1051) return;
const VERSION='10.54', DURATIONS=Object.freeze([3,5,8,10,15,30]), DURATION_KEY='cv-slideshow-duration-seconds';
function readDuration(){try{const n=Number(localStorage.getItem(DURATION_KEY));return DURATIONS.includes(n)?n:8;}catch(_){return 8;}}
let durationSeconds=readDuration();
const SHUFFLE_KEY='cv-slideshow-shuffle';
function readShuffle(){try{return localStorage.getItem(SHUFFLE_KEY)==='true';}catch(_){return false;}}
let shuffle=readShuffle(),passStarted=false,passStartIndex=0,pool=[];
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
 const explicit=filmId?(window.ComicVaultHalloweenKills1062?.data?.slideshowByFilm?.[c.imageSlug]?.[filmId]||window.ComicVaultHalloween2018?.data?.slideshowByFilm?.[c.imageSlug]?.[filmId]||window.ComicVaultFridayPart21059?.data?.slideshowByFilm?.[c.imageSlug]?.[filmId]||c.slideshowByFilm?.[filmId]):c.slideshowBasics;
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
function sourceLabel(c,filmId){
 if(validFilm(filmId))return 'From '+filmLabel(filmId);
 if(c.mediaType==='film'){
  if(validFilm(c.sourceFilmId))return 'From '+filmLabel(c.sourceFilmId);
  const debut=clean(c.firstAppearance).split(/[·—]/)[0].trim();return debut?'Film · '+debut:'Film archive';
 }
 if(c.mediaType==='television'){
  const first=clean(c.firstAppearance);
  const shows=[[/^Buffy(?: the Vampire Slayer)?\b/i,'Buffy the Vampire Slayer'],[/^Angel\b/i,'Angel'],[/^Supernatural\b/i,'Supernatural'],[/^Charmed\b/i,'Charmed'],[/^Grimm\b/i,'Grimm']];
  const match=shows.find(([rx])=>rx.test(first));
  if(match)return 'First TV appearance · '+match[1];
  const explicit=clean(c.sourceShow||c.showTitle||c.seriesTitle);if(explicit)return 'From '+cut(explicit,90);
  return (universeNames[c.publisher]||'Television')+' · TV archive';
 }
 const publisher=universeNames[c.publisher]||c.publisher||'Comic Vault';
 return publisher+' Comics';
}
function portrait(c,filmId){if(c.photoPending)return {missing:true,note:'Photo pending. This dossier is available; a verified portrait will be added later.'};
 const revisions=window.ComicVaultTransport10501?.assetRevisions||{};
 const suffix=file=>revisions[file]||(file==='halloween-john-tate'?'?v=10.50':file==='abigail-arcane'?'?v=10.54':'');
 const supplied=window.ComicVaultFridayPart21059?.suppliedArtwork?.[c.imageSlug];if(supplied&&(!filmId||filmId===supplied.filmId))return {src:'assets/characters/'+supplied.file+'.'+supplied.ext,alt:supplied.alt,note:supplied.note};const media=window.ComicVaultFridayPart21059?.originalMedia?.[c.imageSlug];if(media&&(!filmId||filmId===media.filmId))return {src:'assets/characters/'+media.file+'.'+media.ext,alt:media.alt,original:true,nativeWidth:media.width,nativeHeight:media.height,note:media.note};const cfg=catalog().portraitVariantConfigs?.[c.imageSlug];
 const p=filmId?cfg?.choices?.find(x=>x.filmId===filmId):cfg?.choices?.[0];
 if(['halloween-shirl-jones','halloween-cop-1-h20','halloween-cop-2-h20'].includes(c.imageSlug))return {missing:true,note:c.imageSlug==='halloween-shirl-jones'?'Voice-only character. No on-screen likeness.':'A verified film likeness is not available.'};
 if(c.imageSlug==='friday13-jason'&&(!p||p.originalStill))return {src:'assets/characters/friday13-jason.webp',alt:'Child Jason in the original Friday the 13th (1980) film still',original:true,note:'Original 1980 film still · displayed without enlargement.'};
 if(filmId&&!p&&c.sourceFilmId!==filmId)return {missing:true,note:'A portrait specific to this film is not available. Other-era artwork is not substituted.'};
 if(p){const ext=p.ext||'webp';return {src:'assets/characters/'+p.file+'.'+ext+suffix(p.file),fallback:ext==='webp'?'assets/characters/'+p.file+'.png'+suffix(p.file):null,alt:p.alt||c.name+' · '+(filmId?filmLabel(filmId):'portrait'),note:/reus|reference|existing|same artwork/i.test(p.detail||'')?cut(p.detail,180):''};}
 if(!filmId&&window.ComicVaultFormPortraits?.has(c.imageSlug))return {markup:window.ComicVaultFormPortraits.markup(c.imageSlug,'cvss-form-source'),note:''};
 const file=c.imageSlug;return {src:'assets/characters/'+file+'.webp'+suffix(file),fallback:'assets/characters/'+file+'.png'+suffix(file),alt:c.name+' portrait',note:''};
}
let dialog,scopePanel,main,returnBar,ready=false;
let presentation=false,fullscreenOwned=false,fullscreenPending=false,fullscreenRequest=0;
let chromeHidden=false,chromeTimer=0,chromeHovered=false,pageBlurred=false,inputMode='pointer',wakePointer=null,suppressWakeClickUntil=0,touchWakeUntil=0;
const CHROME_IDLE_MS=3000;
let active=false,dossier=false,suppressClose=false,origin=null,originFocus=null,originOverflow='',filteredSnapshot=[],filterFilm='',scope={kind:'filters',value:''},list=[],index=0,timer=0,playing=false,pointer=null;
const nativeElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
const visible=()=>!!dialog?.open&&!dialog.hidden&&!document.hidden&&getComputedStyle(dialog).display!=='none'&&getComputedStyle(dialog).visibility!=='hidden';
const current=()=>list[index]||null;
/* Controls fade in place: the artwork and information never reflow. Keyboard focus wins over idle hiding. */
const isChrome=node=>!!node?.closest?.('.cvss-header,.cvss-controls');
const chromeFocused=()=>isChrome(document.activeElement);
function clearChromeTimer(){if(chromeTimer)window.clearTimeout(chromeTimer);chromeTimer=0;}
function paintChrome(hidden){
 chromeHidden=!!hidden;if(!dialog)return;dialog.dataset.controlsHidden=String(chromeHidden);
 dialog.querySelectorAll('.cvss-header,.cvss-controls').forEach(el=>{el.inert=chromeHidden||!!(scopePanel&&!scopePanel.hidden);if(chromeHidden)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden');});
}
function canHideChrome(){return active&&presentation&&playing&&!dossier&&visible()&&!pageBlurred&&scopePanel?.hidden&&!chromeFocused()&&!chromeHovered;}
function scheduleChrome(){
 clearChromeTimer();if(!canHideChrome())return;
 chromeTimer=window.setTimeout(()=>{chromeTimer=0;if(canHideChrome())paintChrome(true);},CHROME_IDLE_MS);
}
function showChrome(){paintChrome(false);scheduleChrome();}
function stopChrome(){clearChromeTimer();paintChrome(false);chromeHovered=false;wakePointer=null;suppressWakeClickUntil=0;touchWakeUntil=0;}
function releasePointerFocus(){
 if(inputMode!=='pointer'||!active||!presentation||dossier||!dialog?.open||!scopePanel.hidden)return;
 const focused=document.activeElement;if(isChrome(focused)&&!focused.matches('select,input,textarea'))dialog.focus({preventScroll:true});
 scheduleChrome();
}
function wakePointerDown(event){
 if(!active||!presentation||dossier||!dialog.open)return;inputMode='pointer';
 // Old touch browsers may synthesize mouse events for the same completed wake tap.
 if(event.type==='mousedown'&&Date.now()<touchWakeUntil){event.preventDefault();event.stopImmediatePropagation();return;}
 if(event.type==='touchstart')touchWakeUntil=0;
 const wasHidden=chromeHidden;
 if(wasHidden){
  wakePointer=event.pointerId??'fallback';suppressWakeClickUntil=Date.now()+1500;if(event.type==='touchstart')touchWakeUntil=Date.now()+1500;pointer=null;chromeHovered=false;showChrome();dialog.focus({preventScroll:true});
  event.preventDefault();event.stopImmediatePropagation();return;
 }
 // A new down event is a new deliberate gesture, not the previous wake click.
 if(wakePointer===null)suppressWakeClickUntil=0;
 if(!isChrome(event.target)&&scopePanel.hidden&&chromeFocused())dialog.focus({preventScroll:true});
 showChrome();
}
function wakePointerUp(event){
 if(wakePointer===null)return;
 if(event.pointerId!==undefined&&event.pointerId!==wakePointer)return;
 wakePointer=null;suppressWakeClickUntil=Date.now()+800;event.preventDefault();event.stopImmediatePropagation();showChrome();
}
function chromeClick(event){
 if(!active||!presentation||dossier)return;
 if(chromeHidden||wakePointer!==null||Date.now()<suppressWakeClickUntil){
  wakePointer=null;suppressWakeClickUntil=0;touchWakeUntil=0;event.preventDefault();event.stopImmediatePropagation();showChrome();return;
 }
 showChrome();Promise.resolve().then(releasePointerFocus);
}
function chromeMovement(event){
 if(!active||!presentation||dossier)return;
 if(event.pointerType==='touch'||event.type==='touchmove'){chromeHovered=false;showChrome();return;}
 chromeHovered=isChrome(event.target);showChrome();
}
function chromeKey(event){
 inputMode='keyboard';if(active&&presentation&&!dossier&&dialog?.open){wakePointer=null;suppressWakeClickUntil=0;touchWakeUntil=0;chromeHovered=false;showChrome();}
}
function listFor(next){
 if(next.kind==='movie')return sorted(records().filter(c=>appearance(c,next.value)?.defaultCastFilter===true));
 if(next.kind==='universe')return sorted(records().filter(c=>next.value==='ALL'||c.publisher===next.value));
 return filteredSnapshot.slice();
}
// A pass is one stable permutation of unique imageSlug identities; source records are never mutated.
function shuffled(items){
 const result=items.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
}
function buildPass(startSlug=''){
 pool=canonicalList(listFor(scope));const start=pool.find(c=>c.imageSlug===startSlug);
 if(shuffle){const rest=shuffled(pool.filter(c=>c!==start));list=start?[start,...rest]:rest;index=0;}
 else{list=pool.slice();index=Math.max(0,list.findIndex(c=>c.imageSlug===startSlug));}
 passStarted=false;passStartIndex=0;
}
function setShuffle(value){
 if(typeof value!=='boolean')return false;
 if(value===shuffle){paintControls();showChrome();return true;}
 pause();const slug=current()?.imageSlug;shuffle=value;
 try{localStorage.setItem(SHUFFLE_KEY,String(value));}catch(_){/* Saving a preference must never block browsing. */}
 if(active){
  if(passStarted){
   // Keep this pass's displayed prefix/current. Earlier catalogue entries skipped at launch remain eligible.
   const prefix=list.slice(Math.min(passStartIndex,index),index+1),shown=new Set(prefix.map(c=>c.imageSlug));
   const remaining=pool.filter(c=>!shown.has(c.imageSlug));list=prefix.concat(shuffle?shuffled(remaining):remaining);index=prefix.length-1;passStartIndex=0;
  }else buildPass(slug);
  render();
 }
 paintControls();showChrome();status(shuffle?'Shuffle on. No repeats in this pass. Press Play when ready.':'Shuffle off. Remaining characters use the selected order. Press Play when ready.');return true;
}
function activeFilm(){return scope.kind==='movie'?scope.value:scope.kind==='filters'?filterFilm:'';}
function scopeText(){return scope.kind==='movie'?filmLabel(scope.value):scope.kind==='universe'?(universeNames[scope.value]||scope.value):'Current filtered results';}
function status(message){const el=$('cvSlideshowStatus1051');if(el)el.textContent=message;}
function pause(announce=false){if(timer)window.clearTimeout(timer);timer=0;const was=playing;playing=false;paintControls();showChrome();if(announce&&was)status('Slideshow paused.');}
function setDuration(value){
 const n=Number(value);if(!DURATIONS.includes(n))return false;durationSeconds=n;
 try{localStorage.setItem(DURATION_KEY,String(n));}catch(_){/* Private browsing/storage denial never blocks playback. */}
 paintControls();showChrome();if(playing)schedule();status('Each picture will stay on screen for '+n+' seconds.');return true;
}
function paintPresentation(){
 if(!dialog)return;dialog.dataset.presentation=String(presentation);if(!presentation)stopChrome();
 dialog.querySelector('.cvss-brand').hidden=presentation;
 dialog.querySelector('.cvss-title').hidden=presentation;
 dialog.querySelector('.cvss-scope-button').hidden=presentation;
 $('cvSlideshowPresentationCount1052').hidden=!presentation;
 dialog.querySelector('[data-cvss-action="presentation-options"]').hidden=!presentation;
 const button=dialog.querySelector('[data-cvss-action="presentation"]');
 button.textContent=presentation?'↙ Browse':'⛶ Full screen';button.setAttribute('aria-label',presentation?'Exit full-screen view and return to slideshow browser':'Open centered full-screen view');button.setAttribute('aria-pressed',String(presentation));
 dialog.dataset.nativeFullscreen=String(presentation&&!!nativeElement());
}
function exitNativeFullscreen(){
 fullscreenRequest++;
 if(!fullscreenOwned)return;
 const target=nativeElement();
 if(target===document.documentElement){
  const exit=document.exitFullscreen||document.webkitExitFullscreen;
  try{const result=exit?.call(document);if(result?.catch)result.catch(()=>{});}catch(_){}
 }
 if(!fullscreenPending)fullscreenOwned=false;
}
function enterPresentation(){
 if(!active||dossier||!dialog?.open)return false;pause();presentation=true;setScopeOpen(false,false);paintPresentation();main.scrollTop=0;
 const focus=inputMode==='keyboard'?dialog.querySelector('[data-cvss-action="presentation"]'):dialog;focus.focus({preventScroll:true});showChrome();
 if(nativeElement()){status('Centered full-screen view. Press Play to start.');return true;}
 const target=document.documentElement,request=target.requestFullscreen||target.webkitRequestFullscreen;
 if(!request){status('Full-window view. This browser may keep its address bar visible. Press Play to start.');return true;}
 if(fullscreenPending)return true;
 const token=++fullscreenRequest;fullscreenPending=true;fullscreenOwned=true;
 let outcome;try{outcome=request.call(target,{navigationUI:'hide'});}catch(error){fullscreenPending=false;fullscreenOwned=false;status('Full-window view. Browser fullscreen was not granted. Press Play to start.');return true;}
 Promise.resolve(outcome).then(()=>{
  fullscreenPending=false;
  if(!active||!presentation||dossier||token!==fullscreenRequest){exitNativeFullscreen();return;}
  paintPresentation();status(nativeElement()?'Centered full-screen view. Press Play to start.':'Full-window view. Browser controls may remain visible.');
 }).catch(()=>{fullscreenPending=false;fullscreenOwned=false;if(active&&presentation&&!dossier){paintPresentation();status('Full-window view. Browser fullscreen was not granted. Press Play to start.');}});
 return true;
}
function exitPresentation(){
 if(!presentation)return false;pause();presentation=false;paintPresentation();exitNativeFullscreen();
 dialog.querySelector('[data-cvss-action="presentation"]').focus({preventScroll:true});status('Returned to slideshow browser. Autoplay is off.');return true;
}
function fullscreenChanged(){
 if(active&&presentation&&!dossier)showChrome();
 if(!nativeElement()){const wasOwned=fullscreenOwned;fullscreenOwned=false;if(wasOwned&&active&&presentation&&!dossier){pause();status('Browser fullscreen ended. The slideshow is paused in full-window view.');}}
 paintPresentation();
}
function paintControls(){if(!dialog)return;const count=list.length;
 const prev=dialog.querySelector('[data-cvss-action="previous"]'),next=dialog.querySelector('[data-cvss-action="next"]'),playBtn=dialog.querySelector('[data-cvss-action="play"]'),full=dialog.querySelector('[data-cvss-action="dossier"]');
 prev.disabled=count<2||index===0;next.disabled=count<2||index>=count-1;playBtn.disabled=count<2;full.disabled=!count;
 playBtn.textContent=playing?'Ⅱ Pause':index===count-1&&count>1?'▶ Replay':'▶ Play slideshow';playBtn.setAttribute('aria-pressed',String(playing));playBtn.setAttribute('aria-label',playing?'Pause slideshow':index===count-1&&count>1?'Replay slideshow from the beginning':'Play slideshow, one character every '+durationSeconds+' seconds');
 $('cvSlideshowPlayNote1051').textContent=playing?'Playing · '+durationSeconds+' seconds per picture':count<2?'Autoplay needs at least two characters':'Autoplay is off · press Play to start';
 const shuffleButton=$('cvSlideshowShuffle1054');if(shuffleButton){shuffleButton.setAttribute('aria-pressed',String(shuffle));shuffleButton.setAttribute('aria-label',shuffle?'Turn off shuffle':'Turn on shuffle, without repeats per pass');shuffleButton.querySelector('small').textContent=shuffle?'On · no repeats':'Off · in order';}
 const time=$('cvSlideshowDuration1052');if(time)time.value=String(durationSeconds);
 const countText=$('cvSlideshowPresentationCount1052');if(countText)countText.textContent=count?(index+1)+' / '+count:'0 / 0';
}
function schedule(){if(timer)window.clearTimeout(timer);timer=window.setTimeout(()=>{timer=0;if(!playing||!visible()||!scopePanel.hidden){pause();return;}if(index>=list.length-1){pause(true);return;}index++;render();if(index>=list.length-1){pause();status('End of slideshow. '+current().name+'.');}else schedule();},durationSeconds*1000);}
function play(){if(!active||!visible()||!scopePanel.hidden||list.length<2)return false;if(index>=list.length-1){buildPass();render();}if(!passStarted)passStartIndex=index;passStarted=true;playing=true;paintControls();showChrome();status('Slideshow playing. Changes every '+durationSeconds+' seconds.'+(shuffle?' No repeats in this pass.':''));schedule();return true;}
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
   if(img){img.draggable=false;img.decoding='async';if(p.original){img.width=p.nativeWidth||423;img.height=p.nativeHeight||396;art.style.setProperty('--cvss-still-width',(p.nativeWidth||423)+'px');art.style.setProperty('--cvss-still-height',(p.nativeHeight||396)+'px');}handleImage(img,p,fallback);art.append(img);}else fallback.hidden=false;
  }
  $('cvSlideshowArtNote1051').textContent=p.note||'';$('cvSlideshowArtNote1051').hidden=!p.note;
  $('cvSlideshowName1051').textContent=c.name;$('cvSlideshowSource1052').textContent=sourceLabel(c,activeFilm());$('cvSlideshowRole1051').textContent=b.role;$('cvSlideshowSummary1051').textContent=b.summary;
  $('cvSlideshowSwipe1051').hidden=list.length<2;
  status(c.name+'. Character '+(index+1)+' of '+list.length+'.');
 }else status('No characters match this slideshow. Choose another scope.');
 paintControls();
}
function showDialog(){stopChrome();$('cvSlideshowTop1052')?.setAttribute('aria-expanded','true');suppressClose=false;if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.setAttribute('aria-modal','true');}}document.body.style.overflow='hidden';scheduleChrome();}
function hideDialog(){stopChrome();$('cvSlideshowTop1052')?.setAttribute('aria-expanded','false');pause();exitNativeFullscreen();suppressClose=true;if(dialog.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}document.body.style.overflow=originOverflow;}
function restoreOrigin(){if(origin&&bridge()?.restoreEntry)bridge().restoreEntry(origin);else if(dossier)bridge()?.closeDossier?.();}
function finish({restore=true,focus=true}={}){
 if(!active&&!dossier)return;pause();active=false;presentation=false;paintPresentation();const hadDossier=dossier;dossier=false;setScopeOpen(false,false);hideDialog();returnBar.hidden=true;
 if(restore)restoreOrigin();else if(hadDossier)bridge()?.closeDossier?.();
 origin=null;filteredSnapshot=[];pool=[];list=[];index=0;passStarted=false;passStartIndex=0;pointer=null;
 if(focus&&originFocus?.isConnected)originFocus.focus({preventScroll:true});originFocus=null;
}
function open(options={}){
 if(!ready||!bridge())return false;
 if(active){if(dossier)resume();if(options.fullscreen)enterPresentation();return true;}
 const ctx=bridge().context();origin=bridge().captureEntry?.()||null;originFocus=document.activeElement;originOverflow=document.body.style.overflow;
 filteredSnapshot=canonicalList(bridge().filtered());filterFilm=validFilm(ctx.filmId)?ctx.filmId:'';
 const initialFilm=ctx.profileOpen&&validFilm(ctx.activeFilmId)?ctx.activeFilmId:filterFilm;
 let next=options.kind?{kind:options.kind,value:options.value||''}:initialFilm?{kind:'movie',value:initialFilm}:{kind:'filters',value:''};
 if(!['movie','universe','filters'].includes(next.kind))next={kind:'filters',value:''};
 if(next.kind==='movie'&&!validFilm(next.value))next={kind:'filters',value:''};
 if(ctx.profileOpen&&!initialFilm&&!options.kind&&!filteredSnapshot.some(c=>c.imageSlug===ctx.activeSlug)){const c=records().find(c=>c.imageSlug===ctx.activeSlug);next={kind:'universe',value:c?.publisher||ctx.publisher||'ALL'};}
 presentation=false;paintPresentation();scope=next;buildPass(options.slug||ctx.profileOpen&&ctx.activeSlug||'');active=true;dossier=false;playing=false;returnBar.hidden=true;
 render();setScopeOpen(false,false);showDialog();main.scrollTop=0;dialog.querySelector('[data-cvss-action="close"]').focus({preventScroll:true});if(options.fullscreen)enterPresentation();return true;
}
function selectScope(kind,value=''){
 if(!active||!['movie','universe','filters'].includes(kind)||kind==='movie'&&!validFilm(value))return false;
 pause();const slug=current()?.imageSlug;scope={kind,value};buildPass(slug);render();main.scrollTop=0;return true;
}
function setScopeOpen(value,focus=true){
 if(!scopePanel)return;showChrome();if(value){pause();populateScope();scopePanel.hidden=false;dialog.querySelectorAll('.cvss-header,.cvss-main,.cvss-controls').forEach(n=>n.inert=true);if(focus)scopePanel.querySelector('input:checked')?.focus({preventScroll:true});}
 else {scopePanel.hidden=true;dialog.querySelectorAll('.cvss-header,.cvss-main,.cvss-controls').forEach(n=>n.inert=false);if(focus&&dialog.open)dialog.querySelector(presentation?'[data-cvss-action="presentation-options"]':'[data-cvss-action="scope"]').focus({preventScroll:true});}
 scheduleChrome();
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
 try{bridge().openDossier(c.imageSlug,activeFilm()||null);}catch(error){dossier=false;showDialog();if(presentation&&inputMode==='pointer')dialog.focus({preventScroll:true});if(presentation)showChrome();status('The dossier could not be opened.');console.error(error);return false;}
 returnBar.hidden=false;returnBar.querySelector('span').textContent='Paused at '+c.name+' · '+(index+1)+' of '+list.length;returnBar.querySelector('button').focus({preventScroll:true});return true;
}
function resume(){
 if(!active||!dossier)return false;dossier=false;returnBar.hidden=true;bridge()?.restoreEntry?.(origin);render();showDialog();(presentation&&inputMode==='pointer'?dialog:dialog.querySelector('[data-cvss-action="dossier"]')).focus({preventScroll:true});if(presentation)showChrome();return true;
}
function keydown(event){
 if(!active||dossier||!dialog.open)return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!scopePanel.hidden)setScopeOpen(false);else if(presentation)exitPresentation();else finish();return;}
 if(event.key==='Tab'){
  const root=scopePanel.hidden?dialog:scopePanel;const targets=[...root.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(n=>!n.closest('[hidden]')&&!n.closest('[inert]'));const first=targets[0],last=targets[targets.length-1];
  if(first&&((event.shiftKey&&document.activeElement===first)||document.activeElement===dialog||!root.contains(document.activeElement))){event.preventDefault();(event.shiftKey?last:first).focus();}
  else if(last&&!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}return;
 }
 if(!scopePanel.hidden||event.altKey||event.ctrlKey||event.metaKey||/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName))return;
 if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Home'){pause();index=0;render();}else if(event.key==='End'){pause();index=Math.max(0,list.length-1);render();}else move(event.key==='ArrowRight'?1:-1);}
}
function boot(){
 if(ready||!bridge()||!$('archive')||!$('profileSheet'))return;
 dialog=document.createElement('dialog');dialog.id='cvSlideshow1051';dialog.tabIndex=-1;dialog.setAttribute('aria-labelledby','cvSlideshowTitle1051');dialog.setAttribute('aria-modal','true');
 dialog.innerHTML='<div class="cvss-shell"><header class="cvss-header"><div class="cvss-brand"><span class="cvss-logo" aria-hidden="true">CV</span><span><strong>COMIC VAULT</strong><small>THE CHARACTER ARCHIVE</small></span></div><button type="button" class="cvss-view-button" data-cvss-action="presentation" aria-pressed="false" aria-label="Open centered full-screen view">⛶ Full screen</button><span id="cvSlideshowPresentationCount1052" class="cvss-presentation-count" hidden></span><button type="button" class="cvss-options-button" data-cvss-action="presentation-options" aria-label="Choose slideshow scope" hidden>⚙</button><button type="button" class="cvss-close" data-cvss-action="close" aria-label="Close character slideshow">×</button></header><main class="cvss-main"><h1 id="cvSlideshowTitle1051" class="cvss-title">Character slideshow</h1><button type="button" class="cvss-scope-button" data-cvss-action="scope" aria-haspopup="dialog" aria-controls="cvSlideshowScope1051"><span class="cvss-scope-label" id="cvSlideshowScopeLabel1051"></span><span class="cvss-scope-count" id="cvSlideshowScopeCount1051"></span><span class="cvss-scope-value" id="cvSlideshowScopeValue1051"></span><span class="cvss-chevron" aria-hidden="true">›</span></button><article id="cvSlideshowCard1051" class="cvss-card" aria-labelledby="cvSlideshowName1051"><div id="cvSlideshowArt1051" class="cvss-art"></div><p id="cvSlideshowArtNote1051" class="cvss-art-note" hidden></p><p id="cvSlideshowSwipe1051" class="cvss-swipe">← &nbsp; Swipe to browse &nbsp; →</p><h2 id="cvSlideshowName1051" class="cvss-name"></h2><p id="cvSlideshowRole1051" class="cvss-role"></p><p id="cvSlideshowSource1052" class="cvss-source"></p><p id="cvSlideshowSummary1051" class="cvss-summary"></p><p class="cvss-safe">◇ &nbsp; Spoiler-safe basics</p></article><div id="cvSlideshowEmpty1051" class="cvss-empty" hidden><h3>No characters in this view</h3><p>Choose another movie, universe or set of filters to begin.</p><button type="button" class="cvss-primary" data-cvss-action="scope">Choose a slideshow</button></div></main><footer class="cvss-controls"><div class="cvss-nav" role="group" aria-label="Slideshow controls"><button type="button" data-cvss-action="previous" aria-label="Previous character">‹ &nbsp; Previous</button><button type="button" data-cvss-action="play" aria-pressed="false">▶ Play slideshow</button><button type="button" data-cvss-action="next" aria-label="Next character">Next &nbsp; ›</button></div><div class="cvss-timing"><label for="cvSlideshowDuration1052">Each picture</label><select id="cvSlideshowDuration1052" aria-label="Time per picture"><option value="3">3 sec</option><option value="5">5 sec</option><option value="8">8 sec</option><option value="10">10 sec</option><option value="15">15 sec</option><option value="30">30 sec</option></select></div><button type="button" id="cvSlideshowShuffle1054" class="cvss-shuffle" data-cvss-action="shuffle" aria-pressed="false" aria-label="Turn on shuffle, without repeats per pass" aria-describedby="cvSlideshowShuffleHelp1054"><span>⇄ Shuffle</span><small>Off · in order</small></button><button type="button" class="cvss-primary" data-cvss-action="dossier">Open dossier &nbsp; ›</button><p id="cvSlideshowPlayNote1051" class="cvss-play-note"></p></footer></div><section id="cvSlideshowScope1051" class="cvss-scope-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="cvSlideshowScopeTitle1051"><form class="cvss-scope-panel"><div class="cvss-scope-heading"><h2 id="cvSlideshowScopeTitle1051">Choose your slideshow</h2><button type="button" class="cvss-close" data-cvss-action="scope-close" aria-label="Cancel scope selection">×</button></div><p>Browse only the characters you pick.</p><fieldset class="cvss-options"><legend class="cvss-sr">Slideshow scope</legend><div class="cvss-option"><label><input type="radio" name="cvss-mode" value="movie"><span>A movie<small>Keep one film and continuity together.</small></span></label><label class="cvss-sr" for="cvSlideshowMovie1051">Choose a movie</label><select id="cvSlideshowMovie1051" data-cvss-mode="movie"></select></div><div class="cvss-option"><label><input type="radio" name="cvss-mode" value="universe"><span>A universe<small>Choose a world from your archive.</small></span></label><label class="cvss-sr" for="cvSlideshowUniverse1051">Choose a universe</label><select id="cvSlideshowUniverse1051" data-cvss-mode="universe"></select></div><div class="cvss-option"><label><input type="radio" name="cvss-mode" value="filters"><span>Current filters<small>Use the exact results from your archive.</small></span></label></div></fieldset><p>Autoplay stays off until you press Play.</p><p id="cvSlideshowShuffleHelp1054">Shuffle shows each selected character once per pass. Previous can revisit a character; Replay starts a fresh pass.</p><button type="submit" class="cvss-primary" id="cvSlideshowApply1051">Browse characters</button></form></section><span id="cvSlideshowStatus1051" class="cvss-sr" role="status" aria-live="polite" aria-atomic="true"></span>';
 document.body.append(dialog);paintPresentation();main=dialog.querySelector('.cvss-main');scopePanel=$('cvSlideshowScope1051');
 const topNav=document.querySelector('.cv-shortcuts');if(topNav){const topButton=document.createElement('button');topButton.type='button';topButton.id='cvSlideshowTop1052';topButton.className='cv-shortcut';topButton.setAttribute('aria-label','Open full-screen character slideshow');topButton.setAttribute('aria-haspopup','dialog');topButton.setAttribute('aria-controls','cvSlideshow1051');topButton.setAttribute('aria-expanded','false');topButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="m10 8 5 3-5 3V8ZM8 22h8m-4-4v4"/></svg><span>Slideshow</span>';topButton.addEventListener('click',event=>{event.stopPropagation();open({fullscreen:true});});topNav.append(topButton);topNav.classList.add('cvss-has-launch1052');}
 const archiveButton=document.createElement('button');archiveButton.type='button';archiveButton.id='cvSlideshowArchiveEntry1051';archiveButton.className='cv-slideshow-entry1051';archiveButton.textContent='▶ Character slideshow';archiveButton.addEventListener('click',()=>open());const intro=$('archive').querySelector('.archive-intro');const archiveActions=document.createElement('div');archiveActions.className='cvss-entry-actions1052';(intro||$('archive')).append(archiveActions);archiveActions.append(archiveButton);const archiveFull=document.createElement('button');archiveFull.type='button';archiveFull.id='cvSlideshowArchiveFull1052';archiveFull.className='cv-slideshow-entry1051';archiveFull.textContent='⛶ Full-screen slideshow';archiveFull.addEventListener('click',()=>open({fullscreen:true}));archiveActions.append(archiveFull);
 const profileButton=document.createElement('button');profileButton.type='button';profileButton.id='cvSlideshowProfileEntry1051';profileButton.className='cv-slideshow-entry1051';profileButton.textContent='▶ Browse characters in a slideshow';profileButton.addEventListener('click',()=>open());const profileActions=document.createElement('div');profileActions.className='cvss-entry-actions1052 cvss-profile-actions1052';$('profileFacts').before(profileActions);profileActions.append(profileButton);const profileFull=document.createElement('button');profileFull.type='button';profileFull.id='cvSlideshowProfileFull1052';profileFull.className='cv-slideshow-entry1051';profileFull.textContent='⛶ Full-screen slideshow';profileFull.addEventListener('click',()=>open({fullscreen:true}));profileActions.append(profileFull);
 returnBar=document.createElement('div');returnBar.id='cvSlideshowReturn1051';returnBar.hidden=true;returnBar.innerHTML='<button type="button" class="cv-slideshow-return1051">‹ Return to slideshow</button><span></span>';$('profileFacts').before(returnBar);returnBar.querySelector('button').addEventListener('click',resume);
 dialog.addEventListener('click',event=>{const action=event.target.closest('[data-cvss-action]')?.dataset.cvssAction;if(!action)return;event.preventDefault();if(action==='close')finish();else if(action==='scope'||action==='presentation-options')setScopeOpen(true);else if(action==='presentation'){if(presentation)exitPresentation();else enterPresentation();}else if(action==='scope-close')setScopeOpen(false);else if(action==='previous')move(-1);else if(action==='next')move(1);else if(action==='play'){if(playing)pause(true);else play();}else if(action==='shuffle')setShuffle(!shuffle);else if(action==='dossier')openDossier();});
 $('cvSlideshowDuration1052').addEventListener('change',event=>setDuration(event.target.value));
 scopePanel.addEventListener('change',updateDraft);scopePanel.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const draft=scopeDraft();selectScope(draft.kind,draft.value);setScopeOpen(false);});
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!scopePanel.hidden)setScopeOpen(false);else if(presentation)exitPresentation();else finish();});dialog.addEventListener('close',()=>{if(dialog.open)return;pause();if(!suppressClose&&active)finish();});
 // Capture wake gestures before controls or swipe handlers can react to them.
 window.addEventListener('keydown',chromeKey,true);window.addEventListener('keydown',keydown,true);
 window.addEventListener('pointerdown',()=>{inputMode='pointer';},true);
 dialog.addEventListener('pointerdown',wakePointerDown,{capture:true,passive:false});
 dialog.addEventListener('pointerup',wakePointerUp,{capture:true,passive:false});
 dialog.addEventListener('pointercancel',()=>{if(wakePointer!==null){wakePointer=null;suppressWakeClickUntil=Date.now()+800;}pointer=null;showChrome();},true);
 dialog.addEventListener('click',chromeClick,true);dialog.addEventListener('pointermove',chromeMovement,{passive:true});
 dialog.addEventListener('pointerleave',()=>{chromeHovered=false;scheduleChrome();},{passive:true});
 if(!window.PointerEvent){
  window.addEventListener('mousedown',()=>{inputMode='pointer';},true);window.addEventListener('touchstart',()=>{inputMode='pointer';},{capture:true,passive:true});
  dialog.addEventListener('mousedown',wakePointerDown,{capture:true,passive:false});dialog.addEventListener('mouseup',wakePointerUp,{capture:true,passive:false});
  dialog.addEventListener('touchstart',wakePointerDown,{capture:true,passive:false});dialog.addEventListener('touchend',wakePointerUp,{capture:true,passive:false});dialog.addEventListener('touchmove',chromeMovement,{passive:true});dialog.addEventListener('touchcancel',()=>{wakePointer=null;suppressWakeClickUntil=Date.now()+800;pointer=null;showChrome();},{passive:true});dialog.addEventListener('mousemove',chromeMovement,{passive:true});
 }
 dialog.addEventListener('focusin',()=>{if(chromeFocused())showChrome();});
 dialog.addEventListener('focusout',()=>{Promise.resolve().then(()=>{if(active&&presentation&&!dossier)scheduleChrome();});});
 const swipeArea=$('cvSlideshowCard1051');swipeArea.addEventListener('pointerdown',event=>{if(event.isPrimary===false){pointer=null;return;}if(event.button>0||event.target.closest('button,a,input,select'))return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,time:Date.now()};},{passive:true});
 swipeArea.addEventListener('pointerup',event=>{if(!pointer||event.pointerId!==pointer.id)return;const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y,ms=Date.now()-pointer.time;pointer=null;if(ms<1200&&Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);},{passive:true});swipeArea.addEventListener('pointercancel',()=>{pointer=null;},{passive:true});
 document.addEventListener('fullscreenchange',fullscreenChanged);document.addEventListener('webkitfullscreenchange',fullscreenChanged);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();stopChrome();}else if(active&&presentation&&!dossier)showChrome();});window.addEventListener('pagehide',()=>{pageBlurred=true;pause();stopChrome();});window.addEventListener('pageshow',()=>{pageBlurred=false;if(active&&presentation&&!dossier)showChrome();});window.addEventListener('blur',()=>{pageBlurred=true;pause();stopChrome();});window.addEventListener('focus',()=>{pageBlurred=false;if(active&&presentation&&!dossier)showChrome();});
 new MutationObserver(()=>{if(active&&!visible()){pause();stopChrome();}}).observe(dialog,{attributes:true,attributeFilter:['open','hidden','style']});
 new MutationObserver(()=>{if(active&&dossier&&!$('profileSheet').classList.contains('open'))resume();}).observe($('profileSheet'),{attributes:true,attributeFilter:['class']});
 // Preserve native page/history handling. A browser navigation dismisses this overlay, never reopens it.
 window.addEventListener('popstate',()=>{if(active){pause();if(!dossier)finish({restore:false,focus:false});else{dossier=false;active=false;returnBar.hidden=true;origin=null;}}},true);
 ready=true;
}
window.ComicVaultSlideshow1051=Object.freeze({version:VERSION,setDuration,setShuffle,order:()=>list.map(c=>c.imageSlug),enterPresentation,exitPresentation,open,close:()=>finish(),state:()=>({ready,open:!!dialog?.open,active,dossier,playing,presentation,shuffle,passStarted,controlsHidden:chromeHidden,controlsIdleTimer:!!chromeTimer,durationSeconds,nativeFullscreen:!!nativeElement(),index,count:list.length,slug:current()?.imageSlug||null,scope:{...scope},filmId:activeFilm()||null}),selectScope,next:()=>move(1),previous:()=>move(-1),play,pause:()=>pause(true),openDossier,resume,inspect:(slug,filmId='')=>{const c=records().find(c=>c.imageSlug===slug);return c?{basics:basics(c,filmId),portrait:portrait(c,filmId),source:sourceLabel(c,filmId)}:null;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
