import * as fs from 'fs';
import { MarkdownParser } from '../src';

const getSample = function (name: string) {
  return fs.readFileSync(`./test/md/${name}`).toString();
};

describe('Markdown parser', () => {
  const parser = new MarkdownParser();

  it('with empty input: produces empty changelog', () => {
    const c = parser.parse('');
    expect(c.title).toBe('');
    expect(c.banner).toEqual([]);
  });

  it('understands just the title', () => {
    const c = parser.parse('# The Changelog');
    expect(c.title).toBe('The Changelog');
    expect(c.banner).toEqual([]);
  });

  it('understands just the banner', () => {
    const c = parser.parse('This is the banner');
    expect(c.title).toBe('');
    expect(c.banner).toEqual(['This is the banner']);
  });

  it('understands title and banner', () => {
    const c = parser.parse('# Changelog\nThis is the banner');
    expect(c.title).toBe('Changelog');
    expect(c.banner).toEqual(['This is the banner']);
  });

  it('understands multiline changes', () => {
    const c = parser.parse([
      '## Unreleased',
      '### Added',
      '- A new',
      'cool feature',
    ].join('\n'));
    expect(c.unreleased.changes('Added')).toEqual(['A new cool feature']);
  });

  it('can parse single unreleased change', () => {
    const c = parser.parse([
      '# Changelog',
      'This is the banner',
      '## Unreleased',
      '### Added',
      '- A new feature',
    ].join('\n'));
    expect(c.title).toBe('Changelog');
    expect(c.banner).toEqual(['This is the banner']);
    expect(c.unreleased.changes('Added')).toEqual(['A new feature']);
  });

  it('can parse sample', () => {
    const c = parser.parse(getSample('keepachangelog.md'));
    expect(c.title).toEqual('Changelog');
    expect(c.banner[0].startsWith('All notable changes')).toBe(true);
    expect(c.banner[1]).toContain('Semantic Versioning');

    expect(c.unreleased.diffUrl).toBe('https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD');
    expect(c.unreleased.changes('Changed')).toEqual(
      ['Update and improvement of Polish translation from [@m-aciek](https://github.com/m-aciek).']
    );

    expect(c.releases.length).toBe(12);

    expect(c.releases[0].version).toBe('1.0.0');
    expect(c.releases[0].date).toEqual(new Date('2017-06-20'));
    expect(c.releases[0].diffUrl).toBe('https://github.com/olivierlacan/keep-a-changelog/compare/v0.3.0...v1.0.0');
    expect(c.releases[11].version).toBe('0.0.1');
  });
});

