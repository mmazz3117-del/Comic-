(() => {
  const characters = [...window.COMIC_VAULT_CHARACTERS].sort((a,b)=>a.name.localeCompare(b.name));
  const featuredNames = ["Batman","Superman","Spider-Man","Iron Man"];
  let currentPublisher = "ALL";
  let currentLetter = "ALL";
  let activeCharacter = null;
  let activeTab = "overview";

  const $ = (id) => document.getElementById(id);
  const archiveList = $("archiveList");
  const resultCount = $("resultCount");
  const searchInput = $("searchInput");
  const profileSheet = $("profileSheet");
  const profileBody = $("profileBody");
  const profileTabs = $("profileTabs");
  const sideMenu = $("sideMenu");

  const esc = (s="") => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

  function byName(name){ return characters.find(c=>c.name.toLowerCase()===String(name).toLowerCase()); }

  function makeFeatured(){
    const wrap = $("featuredSelector");
    wrap.innerHTML = featuredNames.map((name,i)=>`<button data-feature="${esc(name)}" class="${i===0?"active":""}">${String(i+1).padStart(2,"0")}</button>`).join("");
    wrap.addEventListener("click", e=>{
      const btn = e.target.closest("[data-feature]");
      if(!btn) return;
      setFeatured(btn.dataset.feature);
    });
  }

  function setFeatured(name){
    const c = byName(name) || characters[0];
    const idx = featuredNames.indexOf(c.name);
    document.querySelectorAll("[data-feature]").forEach(b=>b.classList.toggle("active",b.dataset.feature===c.name));
    $("featuredKicker").textContent = `FEATURED FILE // ${String(Math.max(0,idx)+1).padStart(2,"0")}`;
    $("featuredName").textContent = c.name.toUpperCase();
    $("featuredReal").textContent = c.realName;
    $("featuredFirst").textContent = c.firstAppearance;
    $("featuredArt").querySelector(".art-monogram").textContent = c.name.charAt(0);
    $("featuredArt").querySelector(".art-name").textContent = c.name.toUpperCase();
    $("exploreFeatured").innerHTML = `EXPLORE ${esc(c.name.toUpperCase())} <span>↗</span>`;
    $("exploreFeatured").dataset.character = c.name;
  }

  function makeAlphabet(){
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const available = new Set(characters.map(c=>c.name.charAt(0).toUpperCase()));
    $("alphabet").innerHTML = `<button data-letter="ALL" class="active available">ALL</button>` +
      letters.map(l=>`<button data-letter="${l}" class="${available.has(l)?"available":""}">${l}</button>`).join("");
    $("alphabet").addEventListener("click",e=>{
      const b = e.target.closest("[data-letter]"); if(!b) return;
      currentLetter = b.dataset.letter;
      document.querySelectorAll("#alphabet button").forEach(x=>x.classList.toggle("active",x===b));
      renderArchive();
    });
  }

  function filtered(){
    const q = searchInput.value.trim().toLowerCase();
    return characters.filter(c=>{
      const pubOK = currentPublisher==="ALL" || c.publisher===currentPublisher;
      const letterOK = currentLetter==="ALL" || c.name.toUpperCase().startsWith(currentLetter);
      const hay = [c.name,c.realName,c.publisher,c.base,c.occupation,c.species,...c.teams,...c.powers].join(" ").toLowerCase();
      const searchOK = !q || hay.includes(q);
      return pubOK && letterOK && searchOK;
    });
  }

  function renderArchive(){
    const list = filtered();
    resultCount.textContent = `${list.length} FILE${list.length===1?"":"S"}`;
    if(!list.length){ archiveList.innerHTML = `<div class="empty">No character files match this search.</div>`; return; }

    const groups = {};
    list.forEach(c => { const l = c.name[0].toUpperCase(); (groups[l] ||= []).push(c); });

    archiveList.innerHTML = Object.entries(groups).map(([letter,items])=>`
      <section class="letter-section" id="letter-${letter}">
        <div class="letter-heading">${letter}</div>
        <div class="character-grid">
          ${items.map(c=>{
            const globalIndex = characters.findIndex(x=>x.name===c.name)+1;
            const pubCode = c.publisher==="DC" ? "D" : "M";
            const role = (c.alignment || "File").split("/")[0].trim();
            const occupation = (c.occupation || "").split(",")[0].trim();
            return `
            <button class="char-card" data-character="${esc(c.name)}" data-letter="${letter}" data-publisher="${esc(c.publisher)}">
              <span class="card-topline">
                <span class="char-pub ${c.publisher.toLowerCase()}">${esc(c.publisher)}</span>
                <span class="char-code">CV-${pubCode}${String(globalIndex).padStart(2,"0")}</span>
              </span>
              <span class="card-figure">
                <span class="card-monogram">${esc(c.name.charAt(0))}</span>
              </span>
              <span class="card-copy">
                <span class="card-role">${String(globalIndex).padStart(2,"0")} // ${esc(role)} · ${esc(occupation || "Archive File")}</span>
                <span class="card-title">${esc(c.name)}</span>
                <span class="card-real">${esc(c.realName)}</span>
              </span>
            </button>`;
          }).join("")}
        </div>
      </section>
    `).join("");
  }

  function openProfile(name, tab="overview"){
    const c = byName(name); if(!c) return;
    activeCharacter = c; activeTab = tab;
    $("profilePublisher").textContent = c.publisher;
    $("profileName").textContent = c.name.toUpperCase();
    $("profileRealName").textContent = c.realName;
    $("profileVisual").querySelector(".profile-monogram").textContent = c.name.charAt(0);
    $("profileFacts").innerHTML = [
      ["FIRST APPEARANCE",c.firstAppearance],["ALIGNMENT",c.alignment],["BASE",c.base],["TEAMS",c.teams.slice(0,2).join(", ") || "—"]
    ].map(([l,v])=>`<div class="fact"><label>${esc(l)}</label><strong>${esc(v)}</strong></div>`).join("");
    profileSheet.classList.add("open");
    profileSheet.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    setProfileTab(tab);
    setTimeout(()=>document.querySelector(".sheet-panel").scrollTop=0,10);
  }

  function closeProfile(){
    profileSheet.classList.remove("open");
    profileSheet.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }

  function setProfileTab(tab){
    if(!activeCharacter) return;
    activeTab = tab;
    document.querySelectorAll(".profile-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
    renderProfileBody();
  }

  function renderProfileBody(){
    const c = activeCharacter;
    const attrs = Object.entries(c.attributes).map(([k,v])=>`
      <div class="attribute-row"><label>${esc(k)}</label><div class="attribute-bar"><div class="attribute-fill" style="width:${Math.max(0,Math.min(5,v))*20}%"></div></div><div class="attribute-value">${v}/5</div></div>
    `).join("");

    const info = [
      ["OCCUPATION",c.occupation],["SPECIES",c.species],["BIRTHPLACE",c.birthplace],
      ["HEIGHT",c.height],["EYES",c.eyes],["TEAMS",c.teams.join(", ") || "—"]
    ].map(([l,v])=>`<div class="info-box"><label>${esc(l)}</label><span>${esc(v)}</span></div>`).join("");

    if(activeTab==="overview"){
      profileBody.innerHTML = `
        <section class="body-section"><h3>Character Overview</h3><p>${esc(c.overview)}</p></section>
        <section class="body-section"><h3>Identity File</h3><div class="info-grid">${info}</div></section>
        <section class="body-section"><h3>Attributes</h3><div class="attribute-list">${attrs}</div></section>
        <section class="body-section"><h3>Capabilities</h3><div class="tag-list">${c.powers.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div></section>`;
    } else if(activeTab==="history"){
      profileBody.innerHTML = `
        <section class="body-section"><h3>Character History Timeline</h3><p>Tap an event to expand it.</p>
        <div class="timeline">${c.history.map(([year,title,copy])=>`
          <div class="timeline-event"><button class="timeline-head"><span class="timeline-year">${esc(year)}</span><span class="timeline-title">${esc(title)}</span><span>＋</span></button><div class="timeline-copy">${esc(copy)}</div></div>
        `).join("")}</div></section>`;
    } else if(activeTab==="powers"){
      profileBody.innerHTML = `
        <section class="body-section"><h3>Powers & Skills</h3><div class="tag-list">${c.powers.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div></section>
        <section class="body-section"><h3>Attribute Matrix</h3><div class="attribute-list">${attrs}</div></section>`;
    } else if(activeTab==="allies"){
      profileBody.innerHTML = relationSection("Known Allies",c.allies);
    } else if(activeTab==="enemies"){
      profileBody.innerHTML = relationSection("Known Enemies",c.enemies);
    } else if(activeTab==="costumes"){
      profileBody.innerHTML = `
        <section class="body-section"><h3>Costume / Form Timeline</h3>
          <p>Main comic-continuity designs are separated here from film, television, animation and game versions. Those media galleries can be added as distinct categories later.</p>
          <div class="costume-scroll">${c.costumes.map(([era,title,copy])=>`
            <article class="costume-card"><div class="costume-art">${esc(c.name.charAt(0))}</div><div class="costume-copy"><strong>${esc(era)} — ${esc(title)}</strong><span>${esc(copy)}</span></div></article>
          `).join("")}</div>
        </section>`;
    } else if(activeTab==="comics"){
      profileBody.innerHTML = `
        <section class="body-section"><h3>Recommended Comic Files</h3><p>A starter reading list. We can later add issue ranges, publication dates, writers/artists, continuity labels and personal reading status.</p>
          <div class="comic-list">${c.comics.map((x,i)=>`<div class="comic-item"><strong>${String(i+1).padStart(2,"0")} // ${esc(x)}</strong><span>Reading recommendation</span></div>`).join("")}</div>
        </section>`;
    }
  }

  function relationSection(title,items){
    if(!items.length) return `<section class="body-section"><h3>${esc(title)}</h3><p>No relationship files have been added yet.</p></section>`;
    return `<section class="body-section"><h3>${esc(title)}</h3><p>Tap any character already in the archive to jump directly to that dossier.</p><div class="tag-list">${items.map(name=>{
      const linked = !!byName(name);
      return `<button class="tag ${linked?"link-tag":""}" ${linked?`data-related="${esc(name)}"`:""}>${esc(name)}</button>`;
    }).join("")}</div></section>`;
  }

  function randomCharacter(){
    const c = characters[Math.floor(Math.random()*characters.length)];
    openProfile(c.name);
  }

  document.addEventListener("click",e=>{
    const card = e.target.closest("[data-character]"); if(card){ openProfile(card.dataset.character); return; }
    const rel = e.target.closest("[data-related]"); if(rel){ openProfile(rel.dataset.related); return; }
    if(e.target.closest("[data-close-sheet]")) closeProfile();
    if(e.target.closest("[data-close-menu]")) closeMenu();
    const th = e.target.closest(".timeline-head");
    if(th){ th.parentElement.classList.toggle("open"); th.querySelector("span:last-child").textContent = th.parentElement.classList.contains("open") ? "−" : "＋"; }
  });

  searchInput.addEventListener("input",()=>{ currentLetter="ALL"; document.querySelectorAll("#alphabet button").forEach(b=>b.classList.toggle("active",b.dataset.letter==="ALL")); renderArchive(); });
  $("clearSearch").addEventListener("click",()=>{ searchInput.value=""; renderArchive(); searchInput.focus(); });

  document.querySelector(".publisher-tabs").addEventListener("click",e=>{
    const b=e.target.closest("[data-publisher]"); if(!b) return;
    currentPublisher=b.dataset.publisher;
    document.querySelectorAll(".pub-tab").forEach(x=>x.classList.toggle("active",x===b));
    renderArchive();
  });

  profileTabs.addEventListener("click",e=>{
    const b=e.target.closest("[data-tab]"); if(b) setProfileTab(b.dataset.tab);
  });

  $("exploreFeatured").addEventListener("click",e=>openProfile(e.currentTarget.dataset.character || "Batman"));
  $("randomBtn").addEventListener("click",randomCharacter);
  $("menuRandom").addEventListener("click",()=>{closeMenu();randomCharacter();});
  $("menuBtn").addEventListener("click",()=>{sideMenu.classList.add("open");sideMenu.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";});
  $("homeBtn").addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));

  document.querySelector(".menu-section").addEventListener("click",e=>{
    const b=e.target.closest("[data-jump]"); if(!b) return;
    closeMenu(); document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:"smooth"});
  });

  function closeMenu(){ sideMenu.classList.remove("open");sideMenu.setAttribute("aria-hidden","true");document.body.style.overflow=""; }

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){ if(profileSheet.classList.contains("open")) closeProfile(); if(sideMenu.classList.contains("open")) closeMenu(); }
  });

  makeFeatured();
  makeAlphabet();
  setFeatured("Batman");
  renderArchive();
})();
