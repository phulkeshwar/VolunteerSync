const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../client/src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace light mode colors with dark mode colors
const replacements = [
  // Base text & background
  { from: /color: #14213d;/g, to: 'color: #f8fafc;' }, // Body text
  { from: /background:\s+radial-gradient[\s\S]+?linear-gradient[^;]+;/g, to: 'background: #0f172a;' }, // Body background
  { from: /color-scheme: light;/g, to: 'color-scheme: dark;' },
  
  // Headings & strong text
  { from: /color: #0f172a;/g, to: 'color: #f8fafc;' },
  
  // Muted text
  { from: /color: #516170;/g, to: 'color: #94a3b8;' },
  
  // Panels, Cards, Auth-Cards
  { from: /background: rgba\(255, 255, 255, 0\.82\);/g, to: 'background: #1e293b;' },
  { from: /background: rgba\(255, 255, 255, 0\.72\);/g, to: 'background: #1e293b;' },
  { from: /background: #fff;/g, to: 'background: #1e293b;' },
  { from: /inset 0 1px 0 rgba\(255, 255, 255, 0\.65\)/g, to: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' },
  
  // Borders
  { from: /border: 1px solid rgba\(20, 33, 61, 0\.08\);/g, to: 'border: 1px solid rgba(255, 255, 255, 0.08);' },
  { from: /border-bottom: 1px solid rgba\(20, 33, 61, 0\.08\);/g, to: 'border-bottom: 1px solid rgba(255, 255, 255, 0.08);' },
  { from: /border-color: rgba\(31, 122, 140, 0\.55\);/g, to: 'border-color: #3b82f6;' },
  
  // Box shadows
  { from: /box-shadow: 0 24px 64px rgba\(20, 33, 61, 0\.08\)/g, to: 'box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4)' },
  
  // Nav & chips
  { from: /background: rgba\(247, 249, 251, 0\.78\);/g, to: 'background: rgba(15, 23, 42, 0.85);' },
  { from: /background: rgba\(20, 33, 61, 0\.06\);/g, to: 'background: rgba(255, 255, 255, 0.05);' },
  { from: /background: rgba\(20, 33, 61, 0\.05\);/g, to: 'background: rgba(255, 255, 255, 0.05);' },
  { from: /background: rgba\(20, 33, 61, 0\.04\);/g, to: 'background: rgba(255, 255, 255, 0.04);' },
  { from: /background: rgba\(31, 122, 140, 0\.1\);/g, to: 'background: rgba(59, 130, 246, 0.1);' },
  
  // Buttons
  { from: /background: linear-gradient\(135deg, #1f7a8c, #3f88c5\);/g, to: 'background: #3b82f6;' },
  { from: /box-shadow: 0 14px 28px rgba\(31, 122, 140, 0\.25\);/g, to: 'box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);' },
  
  // Accents & primary texts
  { from: /color: #1f7a8c;/g, to: 'color: #3b82f6;' },
  
  // Inputs & forms
  { from: /border: 1px solid rgba\(20, 33, 61, 0\.12\);/g, to: 'border: 1px solid rgba(255, 255, 255, 0.12);' },
  { from: /box-shadow: 0 0 0 4px rgba\(31, 122, 140, 0\.12\);/g, to: 'box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);' },
];

replacements.forEach(({from, to}) => {
  css = css.replace(from, to);
});

// Extra step to change map tiles or other elements if necessary, but we can do that in CSS logic if needed.

fs.writeFileSync(cssPath, css);
console.log('Successfully updated index.css for dark mode');
