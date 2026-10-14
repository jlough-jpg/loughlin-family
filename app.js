(() => {
  'use strict';
  const { people, lineage } = window.familyData;
  const byId = new Map(people.map(person => [person.id, person]));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const memorialUrl = p => `https://www.findagrave.com/memorial/${p.memorial}`;
  const badges = p => `<span class="record-badges">${p.memorial ? '<span class="badge memorial">Memorial source</span>' : ''}${p.chart ? '<span class="badge chart">Family chart</span>' : ''}${p.question ? '<span class="badge uncertain">Open question</span>' : ''}</span>`;
  const personButton = p => `<button class="person-card ${p.id === 'william-d' ? 'focus-card' : ''}" data-person="${esc(p.id)}"><span class="person-role">${esc(p.role)}</span><strong>${esc(p.name)}</strong><span class="person-years">${esc(p.years)}</span><span class="card-bottom">${badges(p)}<span aria-hidden="true">↗</span></span></button>`;
  document.querySelector('#lineage-tree').innerHTML = lineage.map((ids, i) => `<div class="lineage-row"><div class="generation"><span>0${i + 1}</span><small>${['THE ROOTS','THE NEXT GENERATION','WILLIAM’S PARENTS','WILLIAM’S GENERATION'][i]}</small></div><div class="couple ${ids.length === 1 ? 'single' : ''}">${ids.map(id => personButton(byId.get(id))).join('<span class="union" aria-hidden="true">&</span>')}</div></div>`).join('');
  document.querySelector('#focus-couple').innerHTML = ['william-d','agnes'].map(id => personButton(byId.get(id))).join('');
  document.querySelector('#focus-children').innerHTML = ['helen','robert'].map(id => personButton(byId.get(id))).join('');
  document.querySelector('#later-children').innerHTML = ['william-next','mark','john-p','thomas-g','james'].map(id => personButton(byId.get(id))).join('');
  const search = document.querySelector('#family-search');
  const filter = document.querySelector('#family-filter');
  function renderDirectory() {
    const term = search.value.trim().toLocaleLowerCase();
    const matching = people.filter(p => (filter.value === 'all' || p.group === filter.value) && [p.name,p.role,p.birth,p.death,p.partnerName].filter(Boolean).join(' ').toLocaleLowerCase().includes(term));
    document.querySelector('#family-directory').innerHTML = matching.length ? matching.map(personButton).join('') : '<p class="empty-state">No matching records. Try another name or choose a different group.</p>';
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
    document.querySelector('#person-detail').innerHTML = `<p class="eyebrow">${esc(p.role)}</p><h2 id="person-title">${esc(p.name)}</h2><p class="dialog-years">${esc(p.years)}</p>${badges(p)}<dl class="record-facts">${facts.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p>${esc(p.note)}</p>${relatives('Parents shown in this branch',p.parents)}${relatives('Spouse',p.spouse ? [p.spouse] : [])}${relatives('Children shown in this branch',p.children)}<div class="record-source"><h3>Source</h3>${p.memorial ? `<a href="${esc(memorialUrl(p))}" target="_blank" rel="noopener noreferrer">Read the Find a Grave memorial ↗</a><p class="small-note">Information reported by the memorial; original records have not been independently verified.</p>` : ''}${p.chart ? '<p>Handwritten Loughlin family tree, supplied by the family. Later relationships need supporting records.</p>' : ''}</div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.close-dialog').focus();
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-person]');
    if (button) showPerson(button.dataset.person,button);
  });
  function closeDialog() { dialog.close(); }
  dialog.querySelector('.close-dialog').addEventListener('click',closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => opener?.focus());
  document.querySelector('#print-button').addEventListener('click', () => window.print());
})();
