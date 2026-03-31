const fs = require('fs');

try {
  let txt = fs.readFileSync('app/page.js', 'utf8');

  // 1. Remove JS Part
  const jsStart = txt.indexOf('// ─── CURSOR (Bug Fix');
  if (jsStart !== -1) {
    const jsEndText = 'animateRing();';
    const jsEnd = txt.indexOf(jsEndText, jsStart);
    if (jsEnd !== -1) {
      txt = txt.slice(0, jsStart) + txt.slice(jsEnd + jsEndText.length);
    }
  }

  // 2. Remove CSS Part
  const cssStart = txt.indexOf('/* ─── CURSOR (Bug Fix');
  if (cssStart !== -1) {
    const cssEnd = txt.indexOf('/* ─── MESH BACKGROUND ─── */', cssStart);
    if (cssEnd !== -1) {
      txt = txt.slice(0, cssStart) + txt.slice(cssEnd);
    }
  }

  // 3. Remove HTML Part
  const htmlStart = txt.indexOf('<!-- CURSOR (Bug fixed');
  if (htmlStart !== -1) {
    const htmlEnd = txt.indexOf('<!-- NAV -->', htmlStart);
    if (htmlEnd !== -1) {
      txt = txt.slice(0, htmlStart) + txt.slice(htmlEnd);
    }
  }

  fs.writeFileSync('app/page.js', txt, 'utf8');
  console.log("Cursor removed successfully.");
} catch (e) {
  console.error("Error removing cursor:", e);
}
