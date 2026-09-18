import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { importProgramForEmail } from '../src/programs/import-program.js';
import { loadProgramCatalog } from '../src/programs/program-catalog.js';

const DEFAULT_CATALOG = new URL(
  '../data/programs/hypertrophy-stability.json',
  import.meta.url,
);

async function main(): Promise<void> {
  const email = requiredArg('email');
  const file = optionalArg('file') ?? fileURLToPath(DEFAULT_CATALOG);

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is missing. Run from squat-api with .env loaded.',
    );
  }

  const catalog = loadProgramCatalog(resolve(file));
  const prisma = new PrismaClient();

  try {
    const result = await importProgramForEmail(prisma, { email, catalog });
    console.log(
      `${result.action} "${catalog.program.name}" for ${email}: ${result.workoutCount} workouts, ${result.exerciseCount} exercises.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

function requiredArg(name: string): string {
  const value = optionalArg(name);
  if (!value) {
    throw new Error(
      'Usage: npm run program:import -- --email you@example.com [--file path.json]',
    );
  }
  return value;
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
