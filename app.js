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
  function render() {
    visible = [...entries].sort((a, b) => {
      if (currentSort === 'level') return a.level - b.level || a.name.localeCompare(b.name);
      if (currentSort === 'arcana') return arcanaRank(a.arcana) - arcanaRank(b.arcana) || a.level - b.level || a.name.localeCompare(b.name);
      return String(a.name).localeCompare(String(b.name)) || a.level - b.level;
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
      row.append(
        makeCell('arcana', entry.arcana || '-------'),
        makeCell('row-level', entry.level),
        makeCell('row-marker', locked.has(entry.id) ? '♥' : '·'),
        makeCell(`row-name${isBlank(entry.name) ? ' placeholder' : ''}`, entry.name || '-------'),
        makeCell(`row-cost${isBlank(entry.cost) ? ' placeholder' : ''}`, entry.cost || '-------'),
      );
      row.classList.toggle('locked', locked.has(entry.id));
      fragment.append(row);
    }
    list.replaceChildren(fragment);
    list.scrollTop = 0;
    select(selectedId);
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
  const statNames = ['St', 'Ma', 'En', 'Ag', 'Lu'];
  const affinityElements = ['Slash', 'Strike', 'Pierce', 'Fire', 'Ice', 'Elec', 'Wind', 'Light', 'Dark'];
  const affinityLabels = { '-': '—', w: 'Weak', s: 'Resist', n: 'Null', r: 'Repel', d: 'Drain' };
  const skillElements = { sla: 'Slash', str: 'Strike', pie: 'Pierce', fir: 'Fire', ice: 'Ice', ele: 'Elec', win: 'Wind', lig: 'Light', dar: 'Dark', alm: 'Almighty', ail: 'Ailment', rec: 'Healing', sup: 'Support', spe: 'Special', pas: 'Passive' };
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
    const entry = entries[id];
    if (!entry) return;
    const recipes = fusion.recipes.get(id);
    playSound(selectSound);
    document.getElementById('fusion-arcana').textContent = entry.arcana;
    document.getElementById('fusion-title').textContent = entry.name;
    document.getElementById('fusion-level').textContent = entry.level;
    let summary;
    if (!recipes.length) summary = 'Cannot be created by fusion.';
    else if (fusion.isSpecial(entry)) summary = `Special fusion of ${recipes[0].length} Personas:`;
    else summary = `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}, lowest-level ingredients first${entry.dlc ? ' (needs its DLC)' : ''}:`;
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
    document.getElementById('fusion-body').scrollTop = 0;
    fusionPanel.hidden = false;
    announcer.textContent = `${entry.name}: ${recipes.length ? `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}` : 'cannot be fused'}.`;
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
