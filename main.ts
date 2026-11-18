import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The image ships beside this module.
const imagePath = fileURLToPath(new URL('./entry.png', import.meta.url));

// The grader provides MAKEFUN_OUTPUT_DIR; default to /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const outputPath = join(outputDir, 'entry.png');

// Every PNG starts with these eight bytes.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function main(): Promise<void> {
  const image = await readFile(imagePath);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, image);

  const written = await readFile(outputPath);
  const hasPngSignature =
    written.length >= PNG_SIGNATURE.length &&
    written.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);

  if (!hasPngSignature) {
    throw new Error(`Expected a non-empty PNG at ${outputPath}`);
  }

  console.log(`Wrote ${outputPath} (${written.length} bytes)`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
