import { Changelog, ChangeSet } from './changelog';

export class MarkdownPrinter {
  /**
   * Returns an array of lines in Markdown representing the given changelog
   * @param changelog
   */
  print(changelog: Changelog): string[] {
    const lines: string[] = [];
    const links = new Map<string, string>();
    if (changelog.title) {
      lines.push(`# ${changelog.title}`);
    }
    if (changelog.banner.length) {
      changelog.banner.forEach(p => lines.push(p, ''));
    }
    if (!changelog.unreleased.isEmpty) {
      if (changelog.unreleased.diffUrl) {
        lines.push('## [Unreleased]');
        links.set('Unreleased', changelog.unreleased.diffUrl);
      } else {
        lines.push('## Unreleased');
      }
      this._printChanges(changelog.unreleased, lines);
    }
    changelog.releases.forEach(r => {
      const date = this._formatDate(r.date);
      if (r.diffUrl) {
        lines.push(`## [${r.version}] - ${date}`);
        links.set(`${r.version}`, r.diffUrl);
      } else {
        lines.push(`## ${r.version} - ${date}`);
      }
      this._printChanges(r, lines);
    });
    links.forEach((url, name) => lines.push(`[${name}]: ${url}`));
    return lines;
  }

  private _printChanges(set: ChangeSet, lines: string[]): void {
    set.types.forEach(type => {
      lines.push(
        `### ${type}`,
        ...set.changes(type).map(c => `- ${c}`),
        ''
      );
    });
  }

  private _formatDate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = `0${date.getUTCMonth() + 1}`.slice(-2);
    const d = `0${date.getUTCDate()}`.slice(-2);
    return `${y}-${m}-${d}`;
  }
}
