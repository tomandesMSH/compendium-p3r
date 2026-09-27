// Works out every fusion recipe for the compendium, following the rules in
// aqiu384/megaten-fusion-tool. DLC Personas are never ingredients or results
// for other Personas, but their own recipes are still listed.
(() => {
  'use strict';

  function buildFusionRecipes(entries, chart, specialRecipes) {
    const arcanaIndex = new Map(chart.arcana.map((arcana, index) => [arcana, index]));
    const base = entries.filter(entry => !entry.dlc);
    const byName = new Map();
    for (const entry of [...base, ...entries.filter(entry => entry.dlc)]) {
      if (!byName.has(entry.name)) byName.set(entry.name, entry);
    }
    const specialTargets = new Set(Object.keys(specialRecipes));
    const pairSpecials = new Map();
    for (const [name, ingredients] of Object.entries(specialRecipes)) {
      if (ingredients.length === 2) pairSpecials.set([...ingredients].sort().join('|'), byName.get(name));
    }

    function resultPools(extra) {
      const pools = new Map(chart.arcana.map(arcana => [arcana, []]));
      for (const entry of extra ? [...base, extra] : base) {
        if (!specialTargets.has(entry.name)) pools.get(entry.arcana)?.push(entry);
      }
      for (const pool of pools.values()) pool.sort((a, b) => a.level - b.level);
      return pools;
    }

    function resultArcana(a, b) {
      const i = arcanaIndex.get(a.arcana);
      const j = arcanaIndex.get(b.arcana);
      if (i === undefined || j === undefined) return undefined;
      const arcana = chart.table[Math.max(i, j)][Math.min(i, j)];
      return arcana === '-' ? undefined : arcana;
    }

    function fuse(a, b, pools) {
      const special = pairSpecials.get([a.name, b.name].sort().join('|'));
      if (special) return special;
      if (a.arcana === b.arcana) {
        // Same arcana: the highest Persona at or below the average level + 1, never an ingredient.
        const limit = (a.level + b.level) / 2 + 1;
        const pool = pools.get(a.arcana).filter(entry => entry !== a && entry !== b && entry.level <= limit);
        return pool[pool.length - 1];
      }
      const arcana = resultArcana(a, b);
      const pool = arcana && pools.get(arcana);
      if (!pool?.length) return undefined;
      // Different arcana: the lowest Persona at or above the average level + 0.5, else the highest.
      const minimum = (a.level + b.level + 1) / 2;
      let index = pool.findIndex(entry => entry.level >= minimum);
      if (index < 0) index = pool.length - 1;
      if (pool[index] === a || pool[index] === b) index++;
      return pool[index];
    }

    const recipes = new Map(entries.map(entry => [entry.id, []]));
    const pools = resultPools();
    for (let i = 0; i < base.length; i++) {
      for (let j = i + 1; j < base.length; j++) {
        const result = fuse(base[i], base[j], pools);
        if (result) recipes.get(result.id).push([base[i], base[j]]);
      }
    }

    // A DLC Persona is fused as if it were the only DLC in the game.
    for (const dlc of entries.filter(entry => entry.dlc && !specialTargets.has(entry.name))) {
      const dlcPools = resultPools(dlc);
      for (let i = 0; i < base.length; i++) {
        for (let j = i + 1; j < base.length; j++) {
          const a = base[i];
          const b = base[j];
          if (a.arcana !== dlc.arcana && b.arcana !== dlc.arcana && resultArcana(a, b) !== dlc.arcana) continue;
          if (fuse(a, b, dlcPools) === dlc) recipes.get(dlc.id).push([a, b]);
        }
      }
    }

    for (const [name, ingredients] of Object.entries(specialRecipes)) {
      const target = byName.get(name);
      const parts = ingredients.map(ingredient => byName.get(ingredient));
      if (target && parts.every(Boolean)) recipes.set(target.id, [parts]);
    }

    // Recipes you can make earliest come first: lowest top ingredient level, then lowest total.
    const highest = recipe => Math.max(...recipe.map(entry => entry.level));
    const total = recipe => recipe.reduce((sum, entry) => sum + entry.level, 0);
    for (const list of recipes.values()) list.sort((a, b) => highest(a) - highest(b) || total(a) - total(b));
    return { recipes, isSpecial: entry => specialTargets.has(entry.name) };
  }

  window.buildFusionRecipes = buildFusionRecipes;
})();
