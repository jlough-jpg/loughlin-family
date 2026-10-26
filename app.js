(() => {
  'use strict';
  const { people, lineage } = window.familyData;
  const byId = new Map(people.map(person => [person.id, person]));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const memorialUrl = p => `https://www.findagrave.com/memorial/${p.memorial}`;
  const badges = p => `<span class="record-badges">${p.memorial ? '<span class="badge memorial">Memorial source</span>' : ''}${p.chart ? '<span class="badge chart">Family chart</span>' : ''}${p.question ? '<span class="badge uncertain">Open question</span>' : ''}</span>`;
  const personButton = p => `<button class="person-card ${p.id === 'william-d' ? 'focus-card' : ''}" data-person="${esc(p.id)}"><span class="person-role">${esc(p.role)}</span><strong>${esc(p.name)}</strong><span class="person-years">${esc(p.years)}</span><span class="card-bottom">${badges(p)}<span aria-hidden="true">↗</span></span></button>`;
  const cards = ids => ids.map(id => personButton(byId.get(id))).join('');
  const childHouse = id => { const p=byId.get(id); const kids=p.children||[]; return '<article class="child-house '+(id==='dennis'?'dennis-house':'')+'">'+personButton(p)+(p.spouse?'<div class="spouse-note">Spouse: <button data-person="'+esc(p.spouse)+'">'+esc(byId.get(p.spouse).name)+'</button></div>':p.partnerName?'<p class="small-note">Spouse named: '+esc(p.partnerName)+'</p>':'')+'<details '+(id==='dennis'?'open':'')+'><summary>G4 · '+(kids.length?kids.length+(kids.length===1?' child shown':' children shown'):'Descendants not yet recorded')+'</summary>'+(kids.length?'<div class="g4-children">'+cards(kids)+'</div>':'<p class="small-note">No children have been added to this record yet. This does not mean there were none. Follow the source in the person’s record to investigate further.</p>')+'</details></article>'; };
  const branch = (id,spouse,label) => '<details class="brother-branch" open><summary><span>G2 · '+label+'</span><small>Expand or collapse household</small></summary><div class="branch-parents">'+cards([id,spouse])+'</div><h3>G3 · Children of '+label+'</h3><div class="g3-children">'+(byId.get(id).children||[]).map(childHouse).join('')+'</div></details>';
  document.querySelector('#lineage-tree').innerHTML='<div class="tree-roots"><p class="eyebrow">G1 · THE FOUNDING COUPLE</p><div class="branch-parents">'+cards(['thomas','bridget'])+'</div></div><div class="tree-stem" aria-hidden="true"></div><div class="sisters"><h3>G2 · The sisters</h3><p class="small-note">Their records remain part of the tree, although less is known about their lives.</p><div class="sister-cards">'+cards(['elizabeth-early','mary-infant','mary-elder'])+'</div></div><div class="brother-branches">'+branch('john-sr','ellen','John Kane Sr. and Eleanor')+branch('william-elder','eliza','William and Eliza')+'</div>';
  document.querySelector('#connected-families').innerHTML='<article class="connection"><h3>Sweeny and Sweeney</h3><p>Eleanor’s parents and the maternal roots of John Kane Sr.’s children.</p><div class="generation-cards">'+cards(['ellen','dennis-sweeny','margaret'])+'</div><p class="small-note">Dennis Sweeny’s biography also names sons Thomas B. and Dennis H., and brother Hugh. Their individual records have not yet been added.</p></article><article class="connection"><h3>Enue and Eneu</h3><p>William’s wife Eliza connects the family to James and Anna Reese Enue, named in her memorial biography.</p>'+cards(['eliza'])+'<p class="small-note">Further ancestry and spelling differences remain to be researched through the linked memorial.</p></article><article class="connection"><h3>Dornan</h3><p>Katherine’s parents and brother, named in her biography. Their links lead to that source; individual memorials have not yet been established.</p><div class="generation-cards">'+cards(['katherine','dornan-father','dornan-mother','dornan-brother'])+'</div><p class="small-note">The possible printing-business connection remains unverified.</p></article>';
  document.querySelector('#focus-couple').innerHTML = ['william-d','agnes'].map(id => personButton(byId.get(id))).join('');
  document.querySelector('#focus-children').innerHTML = ['helen','robert'].map(id => personButton(byId.get(id))).join('');
  document.querySelector('#later-children').innerHTML = ['william-next','mark','john-p','thomas-g','james'].map(id => personButton(byId.get(id))).join('');
  const search = document.querySelector('#family-search');
  const filter = document.querySelector('#family-filter');
  function renderDirectory() {
    const term = search.value.trim().toLocaleLowerCase();
    const matching = people.filter(p => (filter.value === 'all' ? p.generation <= 4 && !p.connected : filter.value === 'connected' ? p.connected : filter.value === 'later' ? p.generation > 4 : String(p.generation) === filter.value && !p.connected) && [p.name,p.role,p.birth,p.death,p.partnerName,p.note].filter(Boolean).join(' ').toLocaleLowerCase().includes(term));
    const groupName = p => p.connected ? 'Connected family records' : p.generation===1 ? 'G1 · Thomas and Bridget' : p.generation===2 ? 'G2 · Children of Thomas and Bridget, with spouses' : p.generation>4 ? 'Beyond G4 · Later descendants' : p.parents?.includes('john-sr') ? 'G3 · Children of John Kane Sr. and Eleanor' : p.parents?.includes('william-elder') ? 'G3 · Children of William and Eliza' : p.parents?.includes('dennis') ? 'G4 · Children of Dennis Joseph and Katherine Dornan' : p.parents?.includes('william-h') ? 'G4 · Children of William H. and Katie Doyle' : p.parents?.includes('john-jr') ? 'G4 · Children of John Kane Jr. and Eva Cantwell' : p.parents?.includes('mary-helen') ? 'G4 · Child of Mary Helen and Alfred Willemin' : 'G'+p.generation+' · Spouses';
    const grouped = new Map(); matching.slice().sort((a,b)=>a.generation-b.generation).forEach(p=>{const label=groupName(p); if(!grouped.has(label))grouped.set(label,[]); grouped.get(label).push(p);});
    document.querySelector('#family-directory').innerHTML=matching.length?[...grouped].map(([label,members])=>'<section class="generation-group"><h3>'+esc(label)+'</h3><div class="generation-cards">'+members.map(personButton).join('')+'</div></section>').join(''):'<p class="empty-state">No matching records in this view. Try another name or choose a different view.</p>';
    document.querySelector('#results-count').textContent = `${matching.length} ${matching.length === 1 ? 'person' : 'people'} shown`;
  }
  search.addEventListener('input', renderDirectory);
  filter.addEventListener('change', renderDirectory);
  renderDirectory();
  const dialog = document.querySelector('#person-dialog');
  let opener;
  function relatives(title, ids) {
    if (!ids?.length) return '';
    return `<div class="record-relatives"><h3>${esc(title)}</h3>${ids.map(id => `<button class="relative-link" data-person="${esc(id)}">${esc(byId.get(id).name)} <span aria-hidden="true">→</span></button>`).join('')}</div>`;
  }
  function showPerson(id, button) {
    const p = byId.get(id);
    if (!p) return;
    if (!dialog.open) opener = button;
    const facts = [['Born',p.birth],['Died',p.death],['Buried',p.burial],['Spouse named in source',p.partnerName]].filter(([,v]) => v);
    document.querySelector('#person-detail').innerHTML = `<p class="eyebrow">${p.connected ? "Connected family" : "G"+p.generation} · ${esc(p.role)}</p><h2 id="person-title">${esc(p.name)}</h2><p class="dialog-years">${esc(p.years)}</p>${badges(p)}<dl class="record-facts">${facts.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p>${esc(p.note)}</p>${relatives('Parents shown in this branch',p.parents)}${relatives('Siblings',people.filter(s=>s.id!==p.id && p.parents?.length && s.parents?.some(id=>p.parents.includes(id))).map(s=>s.id))}${relatives('Spouse',p.spouse ? [p.spouse] : [])}${relatives('Children shown in this branch',p.children)}<div class="record-source"><h3>Sources</h3>${(p.additionalSources || []).map(s => `<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></p>`).join('')}${p.memorial ? `<a href="${esc(memorialUrl(p))}" target="_blank" rel="noopener noreferrer">${p.connected || p.id === "elizabeth-early" || p.parents?.includes("william-elder") || p.id === "florant" ? "Read the family source on Find a Grave ↗" : "Read the Find a Grave memorial ↗"}</a><p class="small-note">Information reported by the memorial; original records have not been independently verified.</p>` : ''}${p.chart ? '<p>Handwritten Loughlin family tree, supplied by the family. Later relationships need supporting records.</p>' : ''}</div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.close-dialog').focus();
  }
  document.addEventListener('click', e => {
    const jump = e.target.closest('[data-generation]'); if (jump) { filter.value = jump.dataset.generation; search.value = ''; renderDirectory(); }
    const button = e.target.closest('[data-person]');
    if (button) showPerson(button.dataset.person,button);
  });
  function closeDialog() { dialog.close(); }
  dialog.querySelector('.close-dialog').addEventListener('click',closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => opener?.focus());
  document.querySelector('#print-button').addEventListener('click', () => window.print());
  function openLinkedPerson() {
    if (location.hash.startsWith('#person-')) showPerson(location.hash.slice(8));
  }
  window.addEventListener('hashchange',openLinkedPerson);
  openLinkedPerson();
})();

