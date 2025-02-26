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
      const matchOffset = match[0];
      const matchKeyword = match[1][0] ?? '';

      // This part calculates the line number of the match
      for (
        let nextOffset = nlOffsets[currentLine];
        nextOffset !== undefined && matchOffset > nextOffset;
        nextOffset = nlOffsets[++currentLine]
      );

      return [matchKeyword, offset + matchOffset, lineOffset + currentLine];
    });
  }
}
