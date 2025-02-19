import AhoCorasick from 'ahocorasick';

export type MatcherConfigType = {
  caseSensitive?: boolean;
};

export type ChunkType = {
  text: string;
  offset: number;
  lineOffset: number;
};

// [keyword, offset, line]
export type OccurenceType = [string, number, number];

export class Matcher {
  private trie: AhoCorasick;

  constructor(
    keywords: string[],
    private config?: MatcherConfigType,
  ) {
    const caseSensitive = config?.caseSensitive ?? true;

    keywords = keywords.map((keyword) =>
      caseSensitive ? keyword : keyword.toLowerCase(),
    );

    this.trie = new AhoCorasick(keywords);
  }

  search({ text, offset, lineOffset }: ChunkType): OccurenceType[] {
    const caseSensitive = this.config?.caseSensitive ?? true;

    text = caseSensitive ? text : text.toLowerCase();

    // New line character offsets
    const nlOffsets = Array.from(text.matchAll(/\n/g), (m) => m.index) ?? [];
    let currentLine = 0;

    return this.trie.search(text).map((match) => {
      // This part calculates the line number of the match
      for (
        let nextOffset = nlOffsets[currentLine];
        nextOffset !== undefined && match[0] > nextOffset;
        nextOffset = nlOffsets[++currentLine]
      );

      return [match[1][0] ?? '', offset + match[0], lineOffset + currentLine];
    });
  }
}
