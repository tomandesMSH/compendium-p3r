(() => {
  'use strict';
  const list = document.getElementById('persona-list');
  const nameInput = document.getElementById('player-name');
  const sortButtons = [...document.querySelectorAll('[data-sort]')];
  const track = document.getElementById('scroll-track');
  const thumb = document.getElementById('scroll-thumb');
  const announcer = document.getElementById('announcer');
  const entries = window.COMPENDIUM_ENTRIES.map((entry, id) => ({ ...entry, id }));
  const arcanaOrder = ['Fool', 'Magician', 'Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot', 'Justice', 'Hermit', 'Fortune', 'Strength', 'Hanged Man', 'Death', 'Temperance', 'Devil', 'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'Aeon'];
  const locked = new Set();
  const statNames = ['St', 'Ma', 'En', 'Ag', 'Lu'];
  const affinityElements = ['Slash', 'Strike', 'Pierce', 'Fire', 'Ice', 'Elec', 'Wind', 'Light', 'Dark'];
  const affinityLabels = { '-': '—', w: 'Weak', s: 'Resist', n: 'Null', r: 'Repel', d: 'Drain' };
  const skillElements = { sla: 'Slash', str: 'Strike', pie: 'Pierce', fir: 'Fire', ice: 'Ice', ele: 'Elec', win: 'Wind', lig: 'Light', dar: 'Dark', alm: 'Almighty', ail: 'Ailment', rec: 'Healing', sup: 'Support', spe: 'Special', pas: 'Passive' };
  function recipeCount(count) { return `${count} ${count === 1 ? 'recipe' : 'recipes'}`; }
  let currentSort = 'level';
  let visible = [];
  let selectedId;

  function resize() {
    document.documentElement.style.setProperty('--scale', Math.min(innerWidth / 1920, innerHeight / 1080));
    select(selectedId);
    updateScrollbar();
  }
  window.addEventListener('resize', resize);

  try { nameInput.value = localStorage.getItem('compendium.playerName') || ''; } catch { /* Private browsing may disable storage. */ }
  function saveName() {
    try { localStorage.setItem('compendium.playerName', nameInput.value.trim()); } catch { /* Editing still works without storage. */ }
  }
  nameInput.addEventListener('input', saveName);
  nameInput.addEventListener('blur', () => { nameInput.value = nameInput.value.trim(); saveName(); });
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === 'Escape') { event.preventDefault(); nameInput.blur(); }
  });

  function makeCell(className, text) {
    const cell = document.createElement('span');
    cell.className = className;
    cell.textContent = text;
    return cell;
  }
  function isBlank(value) { return !value || /^[-—\s]+$/.test(value); }
  function rowLabel(entry) {
    return `Level ${entry.level}, ${isBlank(entry.name) ? 'empty entry' : entry.name}${locked.has(entry.id) ? ', locked' : ''}`;
  }
  function arcanaRank(arcana) {
    const rank = arcanaOrder.indexOf(arcana);
    return rank < 0 ? arcanaOrder.length : rank;
  }
  function render(keepScroll = false) {
    const scrollTop = list.scrollTop;
    visible = entries.filter(isShown).sort((a, b) => {
      if (currentSort === 'level') return a.level - b.level || a.name.localeCompare(b.name);
      if (currentSort === 'arcana') return arcanaRank(a.arcana) - arcanaRank(b.arcana) || a.level - b.level || a.name.localeCompare(b.name);
      return String(a.name).localeCompare(String(b.name), 'en') || a.level - b.level;
    });
    if (!visible.some(entry => entry.id === selectedId)) selectedId = visible[0]?.id;
    const fragment = document.createDocumentFragment();
    for (const entry of visible) {
      const row = document.createElement('div');
      row.className = 'persona-row';
      row.id = `persona-${entry.id}`;
      row.dataset.id = entry.id;
      row.setAttribute('role', 'option');
      row.setAttribute('aria-label', rowLabel(entry));
      const arcanaCell = makeCell('arcana', entry.arcana || '-------');
      // Lets the narrow phone layout shrink long arcana names to fit.
      arcanaCell.style.setProperty('--length', arcanaCell.textContent.length);
      row.append(
        arcanaCell,
        makeCell('row-level', entry.level),
        makeCell('row-marker', locked.has(entry.id) ? '♥' : '·'),
        makeCell(`row-name${isBlank(entry.name) ? ' placeholder' : ''}`, entry.name || '-------'),
        makeCell(`row-cost${isBlank(entry.cost) ? ' placeholder' : ''}`, entry.cost || '-------'),
      );
      row.classList.toggle('locked', locked.has(entry.id));
      fragment.append(row);
    }
    list.replaceChildren(fragment);
    list.scrollTop = keepScroll ? scrollTop : 0;
    select(selectedId, !keepScroll);
    updateScrollbar();
  }
  function select(id, scroll = true) {
    selectedId = id;
    for (const row of list.children) row.setAttribute('aria-selected', String(Number(row.dataset.id) === id));
    const row = document.getElementById(`persona-${id}`);
    if (row) {
      list.setAttribute('aria-activedescendant', row.id);
      if (scroll) {
        if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop;
        else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
          list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight;
        }
      }
    } else list.removeAttribute('aria-activedescendant');
  }
  list.addEventListener('click', event => {
    const row = event.target.closest('.persona-row');
    if (!row) return;
    select(Number(row.dataset.id), false);
    list.focus({ preventScroll: true });
    openFusion(selectedId);
  });

  const fusion = window.buildFusionRecipes(entries, window.FUSION_CHART, window.SPECIAL_RECIPES);
  const fusionPanel = document.getElementById('fusion-panel');
  const fusionRecipes = document.getElementById('fusion-recipes');
  const selectSound = new Audio('assets/select.ogg');
  const closeSound = new Audio('assets/close.ogg');
  function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => { /* No sound file, or it failed to load. */ });
  }
  function ingredientButton(entry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fusion-ingredient';
    button.dataset.id = entry.id;
    const detail = document.createElement('small');
    detail.textContent = `${entry.arcana} ${entry.level}`;
    button.append(entry.name, detail);
    return button;
  }
  const personaData = window.PERSONA_DATA || {};
  function infoHeading(text) {
    const heading = document.createElement('h3');
    heading.className = 'info-heading';
    heading.textContent = text;
    return heading;
  }
  function renderInfo(entry) {
    const info = document.getElementById('persona-info');
    const data = personaData[`${entry.name}|${entry.arcana}`];
    if (!data) { info.replaceChildren(); return; }
    const stats = document.createElement('div');
    stats.className = 'stats';
    data.stats.forEach((value, index) => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const bar = document.createElement('span');
      bar.className = 'stat-bar';
      const fill = document.createElement('span');
      fill.style.width = `${Math.min(100, value / 99 * 100)}%`;
      bar.append(fill);
      row.append(makeCell('stat-label', statNames[index]), makeCell('stat-value', value), bar);
      stats.append(row);
    });
    const affinities = document.createElement('div');
    affinities.className = 'affinities';
    affinityElements.forEach(name => affinities.append(makeCell('affinity-name', name)));
    [...data.affinities].forEach(code => affinities.append(makeCell(`affinity-value ${code === '-' ? '' : code}`, affinityLabels[code] || code)));
    const skills = document.createElement('table');
    skills.className = 'skills';
    for (const [name, element, cost, level] of data.skills) {
      const row = skills.insertRow();
      row.insertCell().append(makeCell(`skill-element element-${element}`, skillElements[element] || element));
      const nameCell = row.insertCell();
      nameCell.className = 'skill-name';
      nameCell.textContent = name;
      const costCell = row.insertCell();
      costCell.className = 'skill-cost';
      costCell.textContent = cost;
      const levelCell = row.insertCell();
      levelCell.className = 'skill-level';
      levelCell.textContent = level ? `Lv ${level}` : 'Base';
    }
    info.replaceChildren(infoHeading('Stats'), stats, infoHeading('Affinities'), affinities, infoHeading('Skills'), skills);
  }
  function openFusion(id) {
    if (!entries[id]) return;
    playSound(selectSound);
    fillFusion(id);
    document.getElementById('fusion-body').scrollTop = 0;
    fusionPanel.hidden = false;
    const count = fusion.recipes.get(id).length;
    announcer.textContent = `${entries[id].name}: ${count ? recipeCount(count) : 'cannot be fused'}.`;
  }
  function fillFusion(id) {
    const entry = entries[id];
    const recipes = fusion.recipes.get(id);
    document.getElementById('fusion-arcana').textContent = entry.arcana;
    document.getElementById('fusion-title').textContent = entry.name;
    document.getElementById('fusion-level').textContent = entry.level;
    let summary;
    if (!recipes.length) summary = 'Cannot be created by fusion.';
    else if (fusion.isSpecial(entry)) summary = `Special fusion of ${recipes[0].length} Personas:`;
    else summary = `${recipeCount(recipes.length)}, lowest-level ingredients first${entry.dlc ? ' (needs its DLC)' : ''}:`;
    document.getElementById('fusion-summary').textContent = summary;
    const fragment = document.createDocumentFragment();
    for (const recipe of recipes) {
      const item = document.createElement('li');
      item.className = 'fusion-recipe';
      recipe.forEach((ingredient, index) => {
        if (index) item.append(makeCell('fusion-plus', '+'));
        item.append(ingredientButton(ingredient));
      });
      fragment.append(item);
    }
    fusionRecipes.replaceChildren(fragment);
    renderInfo(entry);
  }
  function closeFusion() {
    if (!fusionPanel.hidden) playSound(closeSound);
    fusionPanel.hidden = true;
    list.focus({ preventScroll: true });
  }
  fusionRecipes.addEventListener('click', event => {
    const button = event.target.closest('.fusion-ingredient');
    if (!button) return;
    select(Number(button.dataset.id));
    openFusion(Number(button.dataset.id));
  });
  document.getElementById('fusion-close').addEventListener('click', closeFusion);

  // Filters: hide DLC Personas, or any ticked Social Link or special fusion Persona.
  const filterMenu = document.getElementById('filter-menu');
  const filterButton = document.getElementById('filter-button');
  const filterCount = document.getElementById('filter-count');
  const socialLinkPersonas = window.SOCIAL_LINK_PERSONAS || {};
  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The choice just won't be remembered. */ }
  }
  const hiddenLinks = new Set(load('compendium.hiddenSocialLinks', []));
  const hiddenSpecials = new Set(load('compendium.hiddenSpecials', []));
  let showDlc = load('compendium.showDlc', true);
  function isShown(entry) {
    if (entry.dlc && !showDlc) return false;
    if (socialLinkPersonas[entry.arcana] === entry.name && hiddenLinks.has(entry.arcana)) return false;
    return !(fusion.isSpecial(entry) && hiddenSpecials.has(entry.name));
  }
  function updateFilterCount() {
    const active = [!showDlc, hiddenLinks.size, hiddenSpecials.size].filter(Boolean).length;
    filterCount.hidden = !active;
    filterCount.textContent = active;
    filterButton.setAttribute('aria-label', active ? `Filters, ${active} active` : 'Filters');
  }
  const dlcSwitch = document.getElementById('show-dlc');
  dlcSwitch.checked = showDlc;
  dlcSwitch.addEventListener('change', () => {
    showDlc = dlcSwitch.checked;
    save('compendium.showDlc', showDlc);
    updateFilterCount();
    render(true);
  });
  // One category of tick boxes, plus a "Hide all" box that ticks or clears every one of them.
  function filterCategory(allId, listId, key, set, options) {
    const all = document.getElementById(allId);
    const inputs = options.map(([label, detail, value]) => {
      const option = document.createElement('label');
      option.className = 'filter-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = value;
      input.checked = set.has(value);
      option.append(input, makeCell('filter-label', label), makeCell('filter-detail', detail));
      return input;
    });
    function sync() {
      all.checked = set.size === inputs.length;
      all.indeterminate = set.size > 0 && set.size < inputs.length;
      save(key, [...set]);
      updateFilterCount();
      render(true);
    }
    for (const input of inputs) {
      input.addEventListener('change', () => {
        if (input.checked) set.add(input.value); else set.delete(input.value);
        sync();
      });
    }
    all.addEventListener('change', () => {
      for (const input of inputs) {
        input.checked = all.checked;
        if (all.checked) set.add(input.value); else set.delete(input.value);
      }
      sync();
    });
    document.getElementById(listId).replaceChildren(...inputs.map(input => input.parentElement));
    all.checked = set.size === inputs.length;
    all.indeterminate = set.size > 0 && set.size < inputs.length;
  }
  filterCategory('hide-social-links', 'social-link-options', 'compendium.hiddenSocialLinks', hiddenLinks, arcanaOrder
    .filter(arcana => socialLinkPersonas[arcana])
    .map(arcana => [arcana, socialLinkPersonas[arcana], arcana]));
  filterCategory('hide-specials', 'special-options', 'compendium.hiddenSpecials', hiddenSpecials, entries
    .filter(entry => fusion.isSpecial(entry))
    .sort((a, b) => a.level - b.level)
    .map(entry => [entry.name, `${entry.arcana} ${entry.level}`, entry.name]));
  updateFilterCount();
  function openFilters() {
    playSound(selectSound);
    filterMenu.hidden = false;
    filterButton.setAttribute('aria-expanded', 'true');
    filterMenu.querySelector('input')?.focus();
  }
  function closeFilters() {
    if (filterMenu.hidden) return;
    playSound(closeSound);
    filterMenu.hidden = true;
    filterButton.setAttribute('aria-expanded', 'false');
    filterButton.focus({ preventScroll: true });
  }
  filterButton.addEventListener('click', () => { if (filterMenu.hidden) openFilters(); else closeFilters(); });
  document.getElementById('filter-close').addEventListener('click', closeFilters);
  filterMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeFilters(); }
  });
  document.addEventListener('pointerdown', event => {
    if (!filterMenu.hidden && !event.target.closest('.filter-menu, .filter-button')) closeFilters();
  });

  // Browsers keep audio muted until the first click or key press on the page.
  const hoverSound = new Audio('assets/hoversfx.ogg');
  hoverSound.preload = 'auto';
  let hoveredRow;
  function playHoverSound() {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(() => { /* Blocked until the page is clicked. */ });
  }
  list.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse') return;
    const row = event.target.closest('.persona-row');
    if (row && row !== hoveredRow) { hoveredRow = row; playHoverSound(); }
  });
  list.addEventListener('pointerleave', () => { hoveredRow = undefined; });
  list.addEventListener('keydown', event => {
    let index = visible.findIndex(entry => entry.id === selectedId);
    const pageSize = Math.max(1, Math.floor(list.clientHeight / (list.firstElementChild?.offsetHeight || 64)) - 1);
    if (event.key === 'ArrowDown') index++;
    else if (event.key === 'ArrowUp') index--;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = visible.length - 1;
    else if (event.key === 'PageDown') index += pageSize;
    else if (event.key === 'PageUp') index -= pageSize;
    else return;
    event.preventDefault();
    if (visible.length) select(visible[Math.max(0, Math.min(visible.length - 1, index))].id);
  });

  function setSort(sort) {
    currentSort = sort;
    for (const button of sortButtons) {
      const active = button.dataset.sort === sort;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    render();
  }
  sortButtons.forEach(button => button.addEventListener('click', () => setSort(button.dataset.sort)));

  function updateScrollbar() {
    const max = list.scrollHeight - list.clientHeight;
    track.hidden = max <= 0;
    const available = Math.max(0, track.clientHeight - thumb.offsetHeight - 12);
    thumb.style.top = `${6 + (max > 0 ? list.scrollTop / max : 0) * available}px`;
  }
  list.addEventListener('scroll', updateScrollbar, { passive: true });
  function dragScroll(event) {
    const bounds = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    list.scrollTop = ratio * (list.scrollHeight - list.clientHeight);
  }
  track.addEventListener('pointerdown', event => { track.setPointerCapture(event.pointerId); dragScroll(event); });
  track.addEventListener('pointermove', event => { if (track.hasPointerCapture(event.pointerId)) dragScroll(event); });
  track.addEventListener('pointerup', event => track.releasePointerCapture(event.pointerId));

  function toggleLock() {
    const entry = visible.find(item => item.id === selectedId);
    if (!entry) return;
    if (locked.has(entry.id)) locked.delete(entry.id); else locked.add(entry.id);
    const row = document.getElementById(`persona-${entry.id}`);
    row.classList.toggle('locked', locked.has(entry.id));
    row.querySelector('.row-marker').textContent = locked.has(entry.id) ? '♥' : '·';
    row.setAttribute('aria-label', rowLabel(entry));
    announcer.textContent = `${isBlank(entry.name) ? `Level ${entry.level}` : entry.name} ${locked.has(entry.id) ? 'locked' : 'unlocked'}.`;
  }
  function goBack() {
    selectedId = undefined;
    setSort('level');
    list.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.target.closest('.filter-menu, .filter-button')) {
      if (event.key === 'Escape') { event.preventDefault(); closeFilters(); }
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'f') { event.preventDefault(); toggleLock(); }
    else if (key === 'c' || key === 'escape') { event.preventDefault(); if (fusionPanel.hidden) goBack(); else closeFusion(); }
    else if (key === 'enter' && event.target === list) { event.preventDefault(); openFusion(selectedId); }
    else if (key === 'q' || key === 'e') {
      event.preventDefault();
      const index = sortButtons.findIndex(button => button.dataset.sort === currentSort);
      setSort(sortButtons[(index + (key === 'e' ? 1 : 2)) % 3].dataset.sort);
    }
  });

  // Title music tries to start at full volume; browsers may block it until the first press.
  const music = new Audio('assets/aria_of_the_soul.mp3');
  const musicVolume = 0.3;
  music.loop = true;
  music.play().catch(() => { /* Started by the start screen instead. */ });

  // Pause while the tab is hidden or the window loses focus; resume on return.
  let musicStarted = false;
  function syncMusic() {
    if (!musicStarted) return;
    if (document.hidden || !document.hasFocus()) music.pause();
    else if (music.paused) music.play().catch(() => { /* Resumes on the next focus. */ });
  }
  music.addEventListener('playing', () => { musicStarted = true; syncMusic(); });
  window.addEventListener('blur', syncMusic);
  window.addEventListener('focus', syncMusic);
  document.addEventListener('visibilitychange', syncMusic);
  function fadeMusic(to, duration = 800) {
    const from = music.volume;
    const begin = performance.now();
    requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - begin) / duration);
      music.volume = from + (to - from) * progress;
      if (progress < 1) requestAnimationFrame(step);
    });
  }

  // Welcome sound for leaving the start screen.
  const startSound = new Audio('assets/welcome.ogg');
  startSound.preload = 'auto';
  function playStartSound() {
    startSound.currentTime = 0;
    startSound.play().catch(() => { /* No sound file, or it failed to load. */ });
  }

  // Clicking Elizabeth in the backdrop plays one of her lines, never the same one twice in a row.
  const elizabethLines = Array.from({ length: 13 }, (_, index) => {
    const line = new Audio(`assets/elizabeth/${index + 1}.wav`);
    line.volume = 0.5;
    return line;
  });
  let elizabethLine;
  document.getElementById('elizabeth').addEventListener('click', () => {
    if (elizabethLine) elizabethLine.pause();
    const others = elizabethLines.filter(line => line !== elizabethLine);
    elizabethLine = others[Math.floor(Math.random() * others.length)];
    playSound(elizabethLine);
  });

  // The start screen's click or key press also lets the browser play sound.
  const startScreen = document.getElementById('start-screen');
  let started = false;
  function start(event) {
    if (started) return;
    started = true;
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('keydown', startOnKey, true);
    document.querySelector('.stage').inert = false;
    startScreen.classList.add('is-hidden');
    document.documentElement.requestFullscreen?.().catch(() => { /* The browser or an iframe may refuse. */ });
    setTimeout(() => { startScreen.hidden = true; }, 450);
    playStartSound();
    if (music.paused) {
      music.volume = musicVolume;
      music.play().catch(() => { /* No music file, or it failed to load. */ });
    } else fadeMusic(musicVolume);
    list.focus({ preventScroll: true });
  }
  function startOnKey(event) {
    // Leave browser shortcuts (Ctrl+R, F5, Tab…) alone.
    if (event.ctrlKey || event.altKey || event.metaKey || /^(Shift|Control|Alt|Meta|Tab|F\d+)$/.test(event.key)) return;
    start(event);
  }
  document.addEventListener('keydown', startOnKey, true);
  startScreen.addEventListener('click', start);
  startScreen.focus();


  render();
  resize();
})();
