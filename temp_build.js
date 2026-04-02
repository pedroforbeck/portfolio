const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

const rootVars = `:root {
  --faint: rgba(255, 255, 255, 0.28);
  --dimmer: rgba(255, 255, 255, 0.10);
  --scroll: 0;

  --bg-color: #000;
  --text-color: #fff;
  --nav-hover: #fff;
  --progress-bg: rgba(255, 255, 255, 0.08);
  --progress-fill: rgba(255, 255, 255, 0.6);
  --divider-grad: rgba(255, 255, 255, 0.12);
  --social-text: rgba(255, 255, 255, 0.22);
  --social-hover: #fff;
  --line-wipe: rgba(255, 255, 255, 0.3);
  --about-body: rgba(255, 255, 255, 0.65);
  --about-em: #fff;
  --card-border: rgba(255, 255, 255, 0.06);
  --card-bg: rgba(255, 255, 255, 0.02);
  --card-glow: rgba(255, 255, 255, 0.12);
  --card-spotlight: rgba(255, 255, 255, 0.06);
  --work-name: rgba(255, 255, 255, 0.35);
  --work-name-hover: rgba(255, 255, 255, 0.85);
  --work-desc: rgba(255, 255, 255, 0.15);
  --work-desc-hover: rgba(255, 255, 255, 0.35);
}

[data-theme='light'] {
  --faint: rgba(0, 0, 0, 0.45);
  --dimmer: rgba(0, 0, 0, 0.20);
  
  --bg-color: #fff;
  --text-color: #000;
  --nav-hover: #000;
  --progress-bg: rgba(0, 0, 0, 0.1);
  --progress-fill: rgba(0, 0, 0, 0.6);
  --divider-grad: rgba(0, 0, 0, 0.15);
  --social-text: rgba(0, 0, 0, 0.35);
  --social-hover: #000;
  --line-wipe: rgba(0, 0, 0, 0.2);
  --about-body: rgba(0, 0, 0, 0.7);
  --about-em: #000;
  --card-border: rgba(0, 0, 0, 0.1);
  --card-bg: rgba(0, 0, 0, 0.03);
  --card-glow: rgba(0, 0, 0, 0.15);
  --card-spotlight: rgba(0, 0, 0, 0.06);
  --work-name: rgba(0, 0, 0, 0.45);
  --work-name-hover: rgba(0, 0, 0, 0.85);
  --work-desc: rgba(0, 0, 0, 0.3);
  --work-desc-hover: rgba(0, 0, 0, 0.6);
}`;

css = css.replace(/:root\s*\{[\s\S]*?--scroll:\s*0;\s*\}/, rootVars);

// Now do global replacements for colors 
css = css.replace(/background:\s*#000/g, 'background: var(--bg-color)');
css = css.replace(/color:\s*#fff/g, 'color: var(--text-color)');

// Cursor is specific, revert background back to #fff so it always does difference
css = css.replace(/#cur\s*\{[\s\S]*?background:\s*var\(--bg-color\);/g, (match) => {
    return match.replace('var(--bg-color)', '#fff');
});
css = css.replace(/#cur\s*\{[\s\S]*?background:\s*var\(--text-color\);/g, (match) => {
    return match.replace('var(--text-color)', '#fff');
});

// Specific replacements
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'background: var(--progress-bg)');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.6\)/g, 'background: var(--progress-fill)');

css = css.replace(/\.nav-mark:hover\s*\{\s*color:\s*var\(--text-color\);\s*\}/g, '.nav-mark:hover {\n  color: var(--nav-hover);\n}');
css = css.replace(/\.nav-right\s*a:hover\s*\{\s*color:\s*var\(--text-color\);\s*\}/g, '.nav-right a:hover {\n  color: var(--nav-hover);\n}');

css = css.replace(/background:\s*linear-gradient\(to bottom,\s*transparent,\s*rgba\(255,\s*255,\s*255,\s*0\.12\),\s*transparent\)/g, 'background: linear-gradient(to bottom, transparent, var(--divider-grad), transparent)');

css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*\.22\)/g, 'color: var(--social-text)');
css = css.replace(/\.social-link:hover\s*\{\s*color:\s*var\(--text-color\);/g, '.social-link:hover {\n  color: var(--social-hover);');

css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.3\)/g, 'background: var(--line-wipe)');
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*\.65\)/g, 'color: var(--about-body)');
css = css.replace(/color:\s*var\(--text-color\);\s*\}/g, 'color: var(--text-color);\n}'); // Revert any bad breaks
css = css.replace(/\.about-body\s*em\s*\{\s*font-style:\s*italic;\s*color:\s*var\(--text-color\);\s*\}/g, '.about-body em {\n  font-style: italic;\n  color: var(--about-em);\n}');
css = css.replace(/\.about-body\s*\.char-wrap\s*em\s*\{\s*font-style:\s*italic;\s*color:\s*var\(--text-color\);\s*\}/g, '.about-body .char-wrap em {\n  font-style: italic;\n  color: var(--about-em);\n}');

css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.06\)/g, 'border: 1px solid var(--card-border)');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'background: var(--card-bg)');
css = css.replace(/var\(--spotlight-color,\s*rgba\(255,\s*255,\s*255,\s*0\.06\)\)/g, 'var(--spotlight-color, var(--card-spotlight))');
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.12\)/g, 'var(--card-glow)');

// work name colors
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*\.35\);\s*transition:\s*color\s*\.3s,\s*letter-spacing\s*\.4s\s*cubic-bezier/g, 'color: var(--work-name);\n  transition: color .3s, letter-spacing .4s cubic-bezier');
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*\.85\);/g, 'color: var(--work-name-hover);');
css = css.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*\.15\);/g, 'color: var(--work-desc);');
css = css.replace(/\.work-item:hover\s*\.work-desc\s*\{\s*color:\s*var\(--work-name\);\s*\}/g, '.work-item:hover .work-desc {\n  color: var(--work-desc-hover);\n}'); // Check earlier replacements!
css = css.replace(/\.work-item:hover\s*\.work-desc\s*\{\s*color:\s*rgba\(255,\s*255,\s*255,\s*\.35\);\s*\}/g, '.work-item:hover .work-desc {\n  color: var(--work-desc-hover);\n}');

fs.writeFileSync('styles.css', css);
console.log('Update finished.');
