/**
 * Changelog document model
 */
export class Changelog {
  /**
   * Title. Usually it is "Changelog"
   */
  public title: string = '';

  /**
   * Banner is a set of markdown paragraphs. Each paragraph is a string with no EOL.
   */
  public banner: string[] = [];

  /**
   * Unreleased changeset
   */
  readonly unreleased: ChangeSet = new ChangeSet();

  /**
   * Releases
   */
  get releases(): Release[] {
    const releases = [...this._map.values()];
    releases.sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });
    return releases;
  }

  private _map = new Map<string, Release>();

  /**
   * Creates a new Changelog document with the default title and banner
   */
  static withDefaultHeading(): Changelog {
    const c = new Changelog();
    c.title = 'Changelog';
    c.banner = [
      'All notable changes to this project will be documented in this file.',
      'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), '
      + 'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).',
    ];
    return c;
  }

  /**
   * Add a new release
   * @param release
   */
  addRelease(release: Release): void {
    const key = release.version;
    if (this._map.has(key)) throw new Error(`Release ${key} already exists`);
    this._map.set(key, release);
  }
}

/**
 * A set of changes
 */
export class ChangeSet {
  /**
   * Diff URL
   */
  diffUrl: string = '';

  /**
   * Does not contain any changes
   */
  get isEmpty(): boolean {
    return this._map.size === 0;
  }

  /**
   * Array of all change types
   */
  get types(): string[] {
    return [...this._map.keys()];
  }

  private readonly _map = new Map<string, Set<string>>();

  /**
   * Add a new change
   * @param type Change type
   * @param text Change description
   */
  add(type: string, text: string): void {
    this._map.has(type) || this._map.set(type, new Set<string>());
    this._map.get(type)!.add(text);
  }

  /**
   * Array of all changes of the given type
   * @param type
   */
  changes(type: string): string[] {
    return this._map.has(type) ? [...this._map.get(type)!.values()] : [];
  }
}

export class Release extends ChangeSet {
  constructor(
    readonly version: string,
    public date: Date,
    public isYanked: boolean = false
  ) {
    super();
  }
}
