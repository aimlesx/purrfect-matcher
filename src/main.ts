import { StaticPool } from 'node-worker-threads-pool';
import { cpus } from 'os';
import * as fs from 'fs';
import {
  run,
  command,
  positional,
  string,
  boolean,
  flag,
  option,
  optional,
  number,
} from 'cmd-ts';
import { MatcherConfigType } from './matcher';
import { Aggregator } from './aggregator';
import { WorkerDataType } from './worker';
import { chunker } from './chunker';
import { KEYWORDS } from './keywords';

/*

1. Main Module - reads file in chunks and sends to the matchers. After all of 
                 the matchers completed it submits the results to the aggregator.
2. The Matcher - searches for matches in the given text.
3. The Aggregator - aggregates the results from the matchers and prints the results.

*/

const BATCH_SIZE = 64;
const CHUNK_SIZE = 1024 ** 2; // 1 MB

const TIMER_LABEL = 'Execution time';

type PositionOutputType = {
  lineOffset: number;
  charOffset: number;
};

interface ProgramArgs {
  input: string;
  output?: string | undefined;
  caseInsensitive?: boolean;
  executionTime?: boolean;
  json?: boolean;
  threads?: number | undefined;
}

const main = async (args: ProgramArgs) => {
  console.log(args);

  if (args.executionTime) console.time(TIMER_LABEL);

  const matcherConfig: MatcherConfigType = {
    caseSensitive: args.caseInsensitive ? false : true,
  };

  const workerData: WorkerDataType = {
    keywords: KEYWORDS,
    config: matcherConfig,
  };

  const threads = args.threads || cpus().length;
  const pool = new StaticPool({
    size: threads,
    workerData: workerData,
    task: __dirname + '/worker.js',
  });

  const aggregator = new Aggregator();

  const chunks = chunker(
    args.input,
    CHUNK_SIZE,
    Math.max(...KEYWORDS.map((k) => k.length)) - 1,
  );
  if (!chunks) return;

  for (let finished = false; !finished; ) {
    const tasks = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const { value, done } = await chunks.next();

      if (done) {
        finished = true;
        break;
      }

      tasks.push(pool.exec(value));
    }

    aggregator.addResult((await Promise.all(tasks)).flat());
  }

  const results = aggregator.getResults();

  const m: { [name: string]: PositionOutputType[] } = {};

  for (const [name, charOffset, lineOffset] of results) {
    if (!m[name]) {
      m[name] = [];
    }

    m[name].push({ lineOffset, charOffset });
  }

  let output: string;
  if (args.json) {
    output = JSON.stringify(m, null, 2);
  } else {
    output = Object.entries(m)
      .map(([name, positions]) => 
        `${name} --> [${positions.map(p => `{lineOffset:${p.lineOffset}, charOffset:${p.charOffset}}`).join(', ')}]`)
      .join('\n');
  }

  if (args.output) {
    fs.writeFileSync(args.output, output);
  } else {
    console.log(output);
  }

  if (args.executionTime) console.timeEnd(TIMER_LABEL);

  pool.destroy();
};

const app = command({
  name: 'purrfect-matcher',
  description: 'The best text matcher out there!',
  version: '1.0.0',
  args: {
    input: positional({
      type: string,
      description: 'path to input file',
    }),
    output: option({
      type: optional(string),
      long: 'output',
      description: 'path to output file',
    }),
    threads: option({
      type: optional(number),
      long: 'threads',
      short: 't',
      description: 'number of threads to use (default: number of CPUs)',
    }),
    caseInsensitive: flag({
      type: boolean,
      long: 'ignore-case',
      short: 'i',
      description: 'case insensitive matching',
    }),
    executionTime: flag({
      type: boolean,
      long: 'time',
      description: 'print execution time',
    }),
    json: flag({
      type: boolean,
      long: 'json',
      description: 'output as JSON',
    }),
  },
  handler: async (args) => {
    await main(args);
  },
});

run(app, process.argv.slice(2));
