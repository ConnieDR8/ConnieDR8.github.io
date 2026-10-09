import { existsSync, readFileSync, appendFileSync } from "node:fs";

function leerReporte(ruta, herramienta) {
  if (!existsSync(ruta)) {
    return `| ${herramienta} | No ejecutado | - | - |`;
  }

  const datos = JSON.parse(readFileSync(ruta, "utf8"));
  const campos = [
    "numPassedTests",
    "numFailedTests",
    "numTotalTests",
  ];

  for (const campo of campos) {
    if (!Number.isInteger(datos[campo])) {
      throw new Error(`Falta ${campo} en ${ruta}`);
    }
  }

  return `| ${herramienta} | ${datos.numPassedTests} | ${datos.numFailedTests} | ${datos.numTotalTests} |`;
}

const resumen = [
  "### Resultados de pruebas automatizadas",
  "",
  "| Herramienta | Aprobadas | Fallidas | Total |",
  "|---|---:|---:|---:|",
  leerReporte("vitest-report.json", "Vitest - Sitio"),
  leerReporte("api/jest-report.json", "Jest - API"),
  "",
].join("\n");

console.log(resumen);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen + "\n");
}