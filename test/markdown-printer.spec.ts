import { Changelog, MarkdownPrinter, MarkdownParser } from '../src';
import * as fs from 'fs';

describe('Markdown Printer', () => {
  const p = new MarkdownPrinter();
  it('can print empty changelog', () => {
    const c = new Changelog();
    c.banner = [];
    c.title = '';
    expect(p.print(c)).toEqual([]);
  });

  it('can print a default changelog', () => {
    expect(p.print(Changelog.withDefaultHeading()).join('\n'))
      .toBe(fs.readFileSync('./test/md/default.md').toString());
  });

  it('reprints the reference file', () => {
    const original = fs.readFileSync('./test/md/keepachangelog.md').toString();
    const expected = fs.readFileSync('./test/md/keepachangelog-reprinted.md').toString().trim();
    const c = new MarkdownParser().parse(original);
    const actual = p.print(c).join('\n');
    expect(actual).toBe(expected);
  });
});
