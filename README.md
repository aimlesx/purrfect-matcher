# Purrfect Matcher

Purrfect Matcher is a powerful text matching tool that reads a file in chunks, processes the chunks using multiple threads, and aggregates the results. It supports case-insensitive matching and can output the results in JSON format.

## Features

- Reads large files in chunks to handle memory efficiently.
- Uses multiple threads to process chunks in parallel.
- Supports case-insensitive matching.
- Outputs results in JSON format or a human-readable format.
- Optionally prints execution time.

## Installation

To install the dependencies, run:

```sh
npm install
```

## Usage

To run the Purrfect Matcher, use the following command:

```bash
npm run start -- <input-file> [options]
```

### Command Line Arguments

- `input` (required): Path to the input file.
- `--output` (optional): Path to the output file. If not specified, the results will be printed to the console.
- `--threads` (optional): Number of threads to use (default: number of CPUs).
- `--ignore-case` (optional): Case insensitive matching.
- `--time` (optional): Print execution time.
- `--json` (optional): Output results in JSON format.

### Example

```bash
npm run start -- input.txt --output results.txt --threads 4 --ignore-case --time --json
```

### Test File

You can download test file from `https://norvig.com/big.txt` by running the following command.

```bash
curl https://norvig.com/big.txt > big.txt
```

## Project Structure

- `src/main.ts`: Main module that reads the file in chunks, processes the chunks using matchers, and aggregates the results.
- `src/matcher.ts`: Matcher module that searches for matches in the given text.
- `src/aggregator.ts`: Aggregator module that aggregates the results from the matchers.
- `src/chunker.ts`: Chunker module that reads the file in chunks.
- `src/worker.ts`: Worker module that processes chunks in parallel using worker threads.
