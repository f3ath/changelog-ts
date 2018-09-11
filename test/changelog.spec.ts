import { Changelog, ChangeSet, Release } from '../src';

describe('Changelog', () => {
  let ch: Changelog;
  beforeEach(() => {
    ch = new Changelog();
  });
  it('can set title', () => {
    ch.title = 'new title';
    expect(ch.title).toBe('new title');
  });
  it('can set banner', () => {
    ch.banner = ['new banner'];
    expect(ch.banner).toEqual(['new banner']);
  });
  it('can add an unreleased change', () => {
    ch.unreleased.add('Fixed', 'my fix');
  });
  it('can set unreleased diffUrl', () => {
    ch.unreleased.diffUrl = 'my diffUrl url';
    expect(ch.unreleased.diffUrl).toBe('my diffUrl url');
  });
  it('can add a release', () => {
    ch.addRelease(new Release('0.1.1', new Date('1981-02-24')));
  });
  it('can not add existing version', () => {
    const release = new Release('0.1.1', new Date('1981-02-24'));
    ch.addRelease(release);
    expect(() => ch.addRelease(release)).toThrowError('Release 0.1.1 already exists')
  });
  it('sorts releases by date', () => {
    ch.addRelease(new Release('1.0.0', new Date('2001-01-01')));
    ch.addRelease(new Release('3.0.0', new Date('2003-01-01')));
    ch.addRelease(new Release('2.0.0', new Date('2002-01-01')));

    expect(ch.releases[0].version).toBe('3.0.0');
    expect(ch.releases[1].version).toBe('2.0.0');
    expect(ch.releases[2].version).toBe('1.0.0');
  })
});

describe('Default Changelog', () => {
  const changelog = Changelog.withDefaultHeading();
  it('has the default title', () => {
    expect(changelog.title).toBe('Changelog');
  });
  it('has the default banner', () => {
    expect(changelog.banner[0].startsWith('All notable changes')).toBe(true);
    expect(changelog.banner[1].includes('Semantic Versioning')).toBe(true);
  });

});
describe('ChangeSet', () => {
  it('will not add two identical changes', () => {
    const set = new ChangeSet();
    set.add('Added', 'New feature');
    set.add('Added', 'New feature');
    expect(set.changes('Added')).toEqual(['New feature']);
  })

});
describe('Release', () => {
  const r = new Release('0.0.1', new Date('1981-02-24'), true);
  it('has diffUrl', () => {
    r.diffUrl = 'my diffUrl';
    expect(r.diffUrl).toBe('my diffUrl');
  });
  it('has version', () => {
    expect(r.version).toBe('0.0.1');
  });
  it('has date', () => {
    expect(r.date.getUTCDate()).toBe(24);
  });
  it('has YANKED flag', () => {
    expect(r.isYanked).toBe(true);
  });
});
