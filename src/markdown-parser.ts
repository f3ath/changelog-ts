import { Changelog, ChangeSet, Release } from './changelog';
import { Links, Marked, Token } from 'marked-ts';

export class MarkdownParser {
  parse(markdown: string): Changelog {
    const md = Marked.debug(markdown);
    const c = new Changelog();
    let state: State = new InitState();
    md.tokens.forEach(t => {
      state = state.after(t);
      state.process(t, c, md.links);
    });
    return c;
  }
}

interface State {
  after(t: Token): State;

  process(t: Token, c: Changelog, links: Links): void;
}

class InitState implements State {
  after(t: Token): State {
    if (t.type == 'heading' && t.depth == 1) {
      return new TitleState();
    }
    if (isRelease(t)) {
      return new ReleaseState();
    }
    if (t.type == 'text') {
      return new BannerState();
    }
    return this;
  }

  process(): void {
  }
}

class TitleState implements State {
  after(t: Token): State {
    if (t.type == 'paragraph') {
      return new BannerState();
    }
    return new InvalidState(this);
  }

  process(t: Token, c: Changelog): void {
    c.title = t.text!;
  }
}

class ChangeState implements State {
  private text = '';
  constructor(private changeset: ChangeSet, private type: string) {
  }

  after(t: Token): State {
    if (t.type == 'heading' && t.depth == 3) {
      return new TypeState(this.changeset);
    }
    if (isRelease(t)) {
      return new ReleaseState();
    }
    return this;
  }

  process(t: Token): void {
    if (t.type === 'text') {
      this.text += ' ' + t.text!;
    } else if (t.type === 'listItemStart') {
      this.text = '';
    } else if (t.type === 'listItemEnd') {
      this.changeset.add(this.type, this.text.trim());
    }
  }
}

class TypeState implements State {
  private type?: string;

  constructor(private changeset: ChangeSet) {
  }

  after(t: Token): State {
    return new ChangeState(this.changeset, this.type!);
  }

  process(t: Token): void {
    this.type = t.text;
  }
}

class ReleaseState implements State {
  private changeset?: ChangeSet;

  after(t: Token): State {
    return new TypeState(this.changeset!);
  }

  process(t: Token, c: Changelog, links: Links): void {
    if (t.text!.match(/^\[?unreleased\]?$/i)) {
      this.changeset = c.unreleased;
      if (links['unreleased']) {
        c.unreleased.diffUrl = links['unreleased'].href;
      }
      return;
    }
    const parsedLine = t.text!.match(/(\S+) - (\d{4}-\d{2}-\d{2})/i);
    if (parsedLine) {
      const [, version, date] = parsedLine;
      const cleanVersion = this.isBracketed(version) ? this.stripBrackets(version) : version;
      const release = new Release(cleanVersion, new Date(date));
      if (links[cleanVersion]) {
        release.diffUrl = links[cleanVersion].href;
      }
      this.changeset = release;
      c.addRelease(release);
      return;
    }
  }

  private isBracketed(version: string): boolean {
    return version.startsWith('[');
  }

  private stripBrackets(version: string): string {
    return version.substr(1, version.length - 2);
  }
}

function isRelease(t: Token) {
  return t.type == 'heading' && t.depth == 2;
}

class BannerState implements State {
  after(t: Token): State {
    if (isRelease(t)) {
      return new ReleaseState();
    }
    return this;
  }

  process(t: Token, c: Changelog): void {
    c.banner.push(t.text!);
  }
}

class InvalidState implements State {
  constructor(readonly prev: State) {
  }

  after(): State {
    return this;
  }

  process(t: Token): void {
    throw new Error(`Invalid state after ${this.prev.constructor.name} and ${JSON.stringify(t)}`);
  }
}

