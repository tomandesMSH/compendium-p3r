# Compendium

Open `index.html` in a browser. This is a standalone static page; it needs no installation, build, or external services. All artwork and fonts are included. To preview over HTTP, run `python -m http.server 8765 --bind 127.0.0.1 --directory compendium` from the repository root, then open `http://127.0.0.1:8765`.

## The list

`entries.js` lists all 194 Personas in Persona 3 Reload: the 173 in the base game plus the 21 from the Persona 4 and Persona 5 DLC sets, which are marked `dlc: true`. Names, arcana and levels come from [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool). Each entry has `level`, `name`, `arcana` and `cost`. Levels can repeat. Summon cost depends on each Persona's stats and skills, so every cost starts as `-------`. To fill one in, edit that line:

```js
  { level: 55, name: "Jatayu", arcana: "Sun", cost: "70,257" },
```

Values are rendered as text, so names cannot inject HTML.

## Persona info

`persona-data.js` holds each Persona's base stats, affinities and skills, also from megaten-fusion-tool (`demon-data.json` and `skill-data.json`).

## Fusion recipes

`fusion.js` works out every recipe when the page loads, using the arcana chart and special recipes in `fusion-data.js` (also from megaten-fusion-tool) and the tool's P3R fusion rules. DLC Personas are never ingredients or results for other Personas, as in a game without the DLC packs; their own recipes still use base-game ingredients. Recipes are sorted so the ones with the lowest-level ingredients come first.

## Controls

- The page opens on a start screen. Any key, click, or tap closes it and switches the page to full screen; browsers only allow sound and full screen after that first press.
- Background music loads from `assets/aria_of_the_soul.mp3` and loops. It plays at full volume on the start screen when the browser allows it, then fades to 30% (`musicVolume` in `app.js`). If the browser blocks it, the first press starts it at 30%.
- Click the name at the top left to edit it. It saves automatically in this browser. Clear it to restore “Click to edit”.
- Scroll the list with the mouse wheel or touch, or drag the cyan scrollbar.
- Focus the list and use ↑/↓, Page Up/Page Down, Home/End.
- Q/E cycle sort modes.
- F toggles a heart marker for the selected entry during the current session.
- Click a Persona, or press Enter on the selected one, to open its panel on the left: stats, affinities, skills (with the level each is learned at), then fusion recipes. Click an ingredient to jump to that Persona's recipes. Esc or C closes the panel.
- With the panel closed, C or Esc restores the initial list view.

The desktop layout follows the supplied 16:9 screenshot. Portrait screens use a compact layout. The completion percentage is omitted.

## Assets

`assets/linux-biolinum-*.otf`: Linux Biolinum (the page's main font) from the Libertine Open Fonts Project, licensed under the GPL with font exception and the SIL Open Font License (see `assets/linux-biolinum-LICENCE.txt`).

`assets/barlow-condensed-*.ttf`: Barlow Condensed, kept as a fallback font, distributed under the SIL Open Font License in `assets/OFL.txt`.

`assets/velvet-room.png`: background edited from the supplied screenshot with the built-in image-generation tool. The edited raster is 1672 × 941 and is fitted to the original 16:9 composition. The interface is rebuilt in HTML/CSS. Because the background was reconstructed and web fonts replace the game's font, this is a close recreation rather than a pixel-identical copy.

### Background edit prompt

Use case: precise-object-edit. Asset type: website background plate, 1920x1080 landscape, 16:9. Input image 1 is the EDIT TARGET, not an inspirational reference.

Primary request: Remove all game UI overlays from this exact screenshot and reconstruct the underlying scene behind them. Keep the exact composition, framing, colors, saturated electric blue Velvet Room, angular black panels, blue wisps, floor, and Elizabeth character at lower left.

REMOVE COMPLETELY: both upper-left player name/level and wallet panels; all top sorting controls, "By Arcana", "By Level", "By Alphabet", "All Personas", "Registered Only" and keyboard symbols; the whole upper-right "Compendium Summon" title; "Select a Persona." and its underline; the entire central/right list including colored row backgrounds, row borders, text, all names, numbers, arcana labels, heart icons, diamonds, scrollbar and selection markers; the footer key legend; "Completed 68%" at bottom right. Remove every text or interface element anywhere, including any tiny remaining traces.

Inpaint formerly covered areas with continuous scene: predominantly black angular room/panel surfaces with soft electric blue wisps across the center and the former list area, and continuing blue floor/panels at bottom right. The dark broad diagonal panel crossing the image and its outer geometric edges are scene composition and must remain, but UI row panels must vanish.

Preserve Elizabeth's face, yellow eyes, silver bob hair, hat, clothing, book, hands, exact pose, scale and position unchanged, except reconstruct small character pixels covered by removed "Select a Persona" lettering/underline and footer controls. Preserve room geometry, perspective, hard panel edges and lighting. Do not add objects or characters. Do not recompose or zoom. No lettering, labels, numbers, logos, symbols, interface, borders, watermark or game controls. Output one clean background image at 1920x1080 or exact 16:9.
