import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "_site");

const publicFiles = [
  "index.html",
  "styles.css",
  "responsive.css",
  "libro-de-visitas.js",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of publicFiles) {
  await copyFile(join(root, file), join(output, file));
}

console.log(`Sitio construido: ${publicFiles.length} archivos`);
