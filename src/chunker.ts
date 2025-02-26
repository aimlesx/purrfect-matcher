import * as fs from 'fs';
import { ChunkType } from './matcher';

export async function* chunker(
  filePath: string,
  chunkSize: number,
  overlap: number,
): AsyncGenerator<ChunkType> {
  let offset = 0;
  let lineOffset = 0;

  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} not found`);
    return;
  }

  let stream: fs.ReadStream;
  try {
    stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  let buffer = '';

  for await (const chunk of stream) {
    buffer += chunk;

    while (buffer.length >= chunkSize) {
      yield {
        text: buffer.slice(0, chunkSize),
        offset,
        lineOffset,
      };

      offset += chunkSize - overlap;
      lineOffset += Array.from(
        buffer.slice(0, chunkSize).matchAll(/\n/g),
      ).length;

      buffer = buffer.slice(chunkSize);
    }
  }

  if (buffer.length > 0) {
    yield {
      text: buffer,
      offset,
      lineOffset,
    };
  }
}
