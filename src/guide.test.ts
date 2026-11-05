import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = new URL('../docs/guide/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const pages = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.md'));

describe('the user guide', () => {
  test('every link and image in both languages points at something that exists', () => {
    const broken: string[] = [];
    for (const dir of [root, join(root, 'es')]) {
      for (const f of pages(dir)) {
        const text = readFileSync(join(dir, f), 'utf8');
        for (const m of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
          const link = m[1]!;
          if (/^https?:/.test(link)) continue;
          if (!existsSync(join(dir, link))) broken.push(`${f}: ${link}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  test('both languages have the same pages, and every screenshot is used', () => {
    const es = pages(root).map((f) => f.replace(/\.md$/, ''));
    expect(es).toHaveLength(13); // the index and twelve pages
    expect(pages(join(root, 'es'))).toHaveLength(13);
    const used = new Set<string>();
    for (const dir of [root, join(root, 'es')]) for (const f of pages(dir)) for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/img\/([\w-]+\.png)/g)) used.add(m[1]!);
    const files = readdirSync(join(root, 'img')).filter((f) => f.endsWith('.png'));
    expect(files.filter((f) => !used.has(f))).toEqual([]);
  });
});
