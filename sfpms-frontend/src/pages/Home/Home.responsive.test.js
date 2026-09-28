import fs from 'fs';
import path from 'path';

describe('Home responsive CSS', () => {
  it('includes a small-screen breakpoint for mobile layout adjustments', () => {
    const cssPath = path.resolve(__dirname, './Home.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    expect(css).toMatch(/@media\s*\(max-width:\s*576px\)/i);
    expect(css).toMatch(/font-size:\s*clamp\s*\(/i);
  });
});



