#!/usr/bin/env node

declare const require: (name: string) => any;
declare const process: {
  argv: string[];
  exit(code?: number): never;
};
const { readFileSync, readdirSync, statSync } = require("fs") as {
  readFileSync: (filePath: string, encoding: string) => string;
  readdirSync: (entryPath: string, options: { withFileTypes: boolean }) => Array<{
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
  }>;
  statSync: (entryPath: string) => {
    isFile(): boolean;
    isDirectory(): boolean;
  };
};
const { resolve, extname } = require("path") as {
  resolve: (...paths: string[]) => string;
  extname: (filePath: string) => string;
};

type Options = {
  ignoreCase: boolean;
  lineNumber: boolean;
  filesWithMatches: boolean;
  fixedStrings: boolean;
  extensions: Set<string>;
  help: boolean;
};

function printHelp(): void {
  console.log(`Usage: grep [options] <pattern> [path]

Options:
  -i, --ignore-case         Case-insensitive search
  -n, --line-number         Show line numbers
  -l, --files-with-matches  Show only file names with matches
  -F, --fixed-strings       Treat pattern as plain text
  --ext=.ts,.js             Restrict search to extensions
  -h, --help                Show this help

Examples:
  grep TODO .
  grep -i "hello world" .\\src
  grep -n --ext=.ts,.tsx "useEffect" .`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(argv: string[]): { options: Options; pattern?: string; targetPath: string } {
  const options: Options = {
    ignoreCase: false,
    lineNumber: false,
    filesWithMatches: false,
    fixedStrings: false,
    extensions: new Set<string>(),
    help: false
  };

  const positional: string[] = [];

  for (const arg of argv) {
    if (arg === "-i" || arg === "--ignore-case") {
      options.ignoreCase = true;
      continue;
    }

    if (arg === "-n" || arg === "--line-number") {
      options.lineNumber = true;
      continue;
    }

    if (arg === "-l" || arg === "--files-with-matches") {
      options.filesWithMatches = true;
      continue;
    }

    if (arg === "-F" || arg === "--fixed-strings") {
      options.fixedStrings = true;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg.startsWith("--ext=")) {
      const rawExtensions = arg.slice("--ext=".length).split(",");
      for (const value of rawExtensions) {
        const trimmed = value.trim();
        if (!trimmed) {
          continue;
        }

        options.extensions.add(trimmed.startsWith(".") ? trimmed.toLowerCase() : `.${trimmed.toLowerCase()}`);
      }
      continue;
    }

    positional.push(arg);
  }

  return {
    options,
    pattern: positional[0],
    targetPath: positional[1] ?? "."
  };
}

function shouldScanFile(filePath: string, options: Options): boolean {
  if (options.extensions.size === 0) {
    return true;
  }

  return options.extensions.has(extname(filePath).toLowerCase());
}

function collectFiles(entryPath: string): string[] {
  const stats = statSync(entryPath);

  if (stats.isFile()) {
    return [entryPath];
  }

  if (!stats.isDirectory()) {
    return [];
  }

  const files: string[] = [];
  const entries = readdirSync(entryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }

    const childPath = resolve(entryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(childPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(childPath);
    }
  }

  return files;
}

function searchFile(filePath: string, matcher: RegExp, options: Options): boolean {
  let content: string;

  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    return false;
  }

  const lines = content.split(/\r?\n/);
  let foundMatch = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    matcher.lastIndex = 0;

    if (!matcher.test(line)) {
      continue;
    }

    foundMatch = true;

    if (options.filesWithMatches) {
      console.log(filePath);
      return true;
    }

    const prefix = options.lineNumber ? `${filePath}:${index + 1}` : filePath;
    console.log(`${prefix}:${line}`);
  }

  return foundMatch;
}

function main(): void {
  const { options, pattern, targetPath } = parseArgs(process.argv.slice(2));

  if (options.help || !pattern) {
    printHelp();
    process.exit(options.help ? 0 : 1);
  }

  const sourcePattern = options.fixedStrings ? escapeRegExp(pattern) : pattern;
  const matcher = new RegExp(sourcePattern, options.ignoreCase ? "i" : "");
  const resolvedPath = resolve(targetPath);
  const files = collectFiles(resolvedPath).filter((filePath: string) => shouldScanFile(filePath, options));

  let hasAnyMatch = false;

  for (const filePath of files) {
    const hasMatch = searchFile(filePath, matcher, options);
    hasAnyMatch = hasAnyMatch || hasMatch;
  }

  process.exit(hasAnyMatch ? 0 : 1);
}

main();


