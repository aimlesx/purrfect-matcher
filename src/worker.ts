import { parentPort, workerData } from 'worker_threads';
import { Matcher, MatcherConfigType, ChunkType } from './matcher';

export type WorkerDataType = {
  keywords: string[];
  config: MatcherConfigType;
};

parentPort?.on('message', (chunk: ChunkType) => {
  const { keywords, config } = workerData as WorkerDataType;

  const matcher = new Matcher(keywords, config);

  const results = matcher.search(chunk);

  parentPort?.postMessage(results);
});
