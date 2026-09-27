// Persona 3 Reload fusion data.
// Source: aqiu384/megaten-fusion-tool (src/app/p3r/data/fusion-chart.json and special-recipes.json).
// FUSION_CHART.table is lower-triangular: table[i][j] (j <= i) is the arcana made by fusing arcana[i] with arcana[j].
// "-" on the diagonal means same-arcana fusion; "-" elsewhere means the pair cannot be fused.
window.FUSION_CHART = {
  arcana: ["Fool", "Magician", "Priestess", "Empress", "Emperor", "Hierophant", "Lovers", "Chariot", "Justice", "Hermit", "Fortune", "Strength", "Hanged Man", "Death", "Temperance", "Devil", "Tower", "Star", "Moon", "Sun", "Judgement", "Aeon"],
  table: [
    ["-"],
    ["Hierophant", "-"],
    ["Magician", "Justice", "-"],
    ["Star", "Hanged Man", "Temperance", "-"],
    ["Temperance", "Lovers", "Justice", "Chariot", "-"],
    ["Hanged Man", "Hermit", "Lovers", "Tower", "Strength", "-"],
    ["Justice", "Chariot", "Magician", "Moon", "Chariot", "Magician", "-"],
    ["Emperor", "Devil", "Fool", "Hermit", "Devil", "Justice", "Priestess", "-"],
    ["Lovers", "Hierophant", "Lovers", "Emperor", "Hanged Man", "Fool", "Emperor", "Magician", "-"],
    ["Priestess", "Moon", "Strength", "Sun", "Hierophant", "Chariot", "Fool", "Lovers", "Magician", "-"],
    ["Strength", "Lovers", "Hanged Man", "Strength", "Star", "Moon", "Temperance", "Priestess", "Hanged Man", "Justice", "-"],
    ["Death", "Emperor", "Moon", "Fool", "Magician", "Fortune", "Hermit", "Temperance", "Star", "Emperor", "Sun", "-"],
    ["Devil", "Fool", "Hierophant", "Star", "Death", "Strength", "Justice", "Strength", "Priestess", "Temperance", "Magician", "Chariot", "-"],
    ["Fortune", "Priestess", "Justice", "Lovers", "Hermit", "Fortune", "Hanged Man", "Hierophant", "Hermit", "Chariot", "Star", "Empress", "Strength", "-"],
    ["Chariot", "Justice", "Fortune", "Hierophant", "Star", "Hermit", "Death", "Hermit", "Moon", "Magician", "Tower", "Moon", "Hierophant", "Devil", "-"],
    ["Hermit", "Temperance", "Emperor", "Tower", "Moon", "Priestess", "Star", "Hanged Man", "Temperance", "Strength", "Empress", "Lovers", "Priestess", "Tower", "Fool", "-"],
    ["Moon", "Chariot", "Empress", "Devil", "Strength", "Temperance", "Sun", "Star", "Sun", "Emperor", "Aeon", "Hanged Man", "Death", "Aeon", "Devil", "Judgement", "-"],
    ["Devil", "Strength", "Emperor", "Priestess", "Hierophant", "Moon", "Death", "Fortune", "Hermit", "Fool", "Magician", "Priestess", "Empress", "Sun", "Fortune", "Justice", "Judgement", "-"],
    ["Empress", "Strength", "Star", "Aeon", "Lovers", "Magician", "Empress", "Temperance", "Temperance", "Hierophant", "Death", "Devil", "Chariot", "Hanged Man", "Priestess", "Fool", "Fortune", "Sun", "-"],
    ["Judgement", "Empress", "Hierophant", "Emperor", "Temperance", "Tower", "Devil", "Strength", "Magician", "Star", "Judgement", "Lovers", "Aeon", "Justice", "Chariot", "Death", "Hierophant", "Justice", "Tower", "-"],
    ["Aeon", "Star", "Hanged Man", "Lovers", "Sun", "Emperor", "Moon", "Empress", "Fool", "Temperance", "Sun", "Devil", "Tower", "Devil", "Empress", "Death", "Aeon", "Tower", "Fortune", "Aeon", "-"],
    ["Death", "Sun", "Empress", "Priestess", "Fortune", "Sun", "Tower", "Hermit", "Judgement", "Devil", "Moon", "Fool", "Death", "-", "Justice", "Star", "Sun", "Judgement", "Judgement", "Empress", "Fool", "-"],
  ],
};

// Personas made only from these exact ingredients.
window.SPECIAL_RECIPES = {
  "Shiva": ["Rangda", "Barong"],
  "Messiah": ["Orpheus", "Thanatos"],
  "Fortuna": ["Angel", "Silky", "Unicorn"],
  "Pale Rider": ["Berith", "Gurulu", "Matador"],
  "Arsene": ["Tam Lin", "Jack-o'-Lantern", "Neko Shogun"],
  "Flauros": ["Forneus", "Berith", "Eligor"],
  "Black Frost": ["Jack Frost", "Jack-o'-Lantern", "King Frost"],
  "Parvati": ["Sati", "Sarasvati", "Dakini"],
  "Mada": ["Hanuman", "Vasuki", "Naga Raja", "Ganesha"],
  "Norn": ["Clotho", "Lachesis", "Atropos"],
  "Alice": ["Pixie", "Lilim", "Narcissus", "Titania"],
  "Kohryu": ["Genbu", "Seiryu", "Suzaku", "Byakko"],
  "Mara": ["Incubus", "Pazuzu", "Mot", "Kumbhanda", "Attis"],
  "Susano-o": ["Take-Minakata", "Take-Mikazuchi", "Okuninushi", "Shiki-Ouji", "Kikuri-Hime"],
  "Thanatos": ["Pisaca", "Pale Rider", "Loa", "Samael", "Mot", "Alice"],
  "Masakado": ["Zouchouten", "Jikokuten", "Koumokuten", "Bishamonten"],
  "Beelzebub": ["Incubus", "Succubus", "Pazuzu", "Lilith", "Baal Zebul", "Abaddon"],
  "Asura": ["Rakshasa", "Girimekhala", "Bishamonten", "Qitian Dasheng", "Atavaka", "Vishnu"],
  "Metatron": ["Uriel", "Raphael", "Gabriel", "Michael"],
  "Lucifer": ["Samael", "Abaddon", "Beelzebub", "Satan", "Helel"],
  "Orpheus Telos": ["Thanatos", "Asura", "Chi You", "Metatron", "Helel", "Messiah"],
  "Satanael": ["Orpheus", "Michael", "Thanatos", "Satan", "Helel", "Lucifer"],
};
