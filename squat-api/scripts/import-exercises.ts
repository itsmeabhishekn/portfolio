import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { loadExerciseCatalog } from '../src/programs/exercise-catalog.js';
import { importExerciseCatalog } from '../src/programs/import-exercises.js';

const DEFAULT_CATALOG = new URL(
  '../data/exercises/taxonomy.json',
  import.meta.url,
);

async function main(): Promise<void> {
  const file = optionalArg('file') ?? fileURLToPath(DEFAULT_CATALOG);

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is missing. Run from squat-api with .env loaded.',
    );
  }

  const catalog = loadExerciseCatalog(resolve(file));
  const prisma = new PrismaClient();

  try {
    const result = await importExerciseCatalog(prisma, catalog);
    console.log(
      `Imported ${result.total} exercises (${result.created} created, ${result.updated} updated).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

function optionalArg(name: string): string | undefined {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
