import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const sitio = new URL(
  process.argv[2] || "https://conniedr8.github.io/"
);

const esperar = (ms) =>
  new Promise((resolver) => setTimeout(resolver, ms));

async function obtener(url, opciones = {}) {
  return fetch(url, {
    ...opciones,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

async function ejecutar() {
  let html = null;

  // GitHub Pages puede tardar en actualizarse
  for (let intento = 1; intento <= 20; intento++) {
    try {
      const respuesta = await obtener(sitio);

      if (respuesta.status === 200) {
        const contenido = await respuesta.text();

        if (contenido.includes("Connie Duran")) {
          html = contenido;
          break;
        }
      }
    } catch (error) {
      console.log(`Intento ${intento}: ${error.message}`);
    }

    await esperar(3000);
  }

  assert.ok(html, "Produccion no responde correctamente");
  console.log("OK: Sitio publicado responde HTTP 200");
  console.log("OK: Nombre Connie Duran encontrado");

  const rutaScript = new URL("libro-de-visitas.js", sitio);
  const respuestaScript = await obtener(rutaScript);

  assert.equal(respuestaScript.status, 200);

  const codigo = await respuestaScript.text();

  // Ejecutar el JavaScript de la pagina usando jsdom
  const dom = new JSDOM(html, {
    url: sitio.href,
    runScripts: "outside-only",
  });

  const seccion = dom.window.document.getElementById(
    "libro-de-visitas"
  );

  assert.ok(seccion, "No existe el libro de visitas");
  assert.equal(seccion.hidden, true);

  let solicitudApi = null;

  dom.window.fetch = (ruta, opciones = {}) => {
    const url = new URL(ruta, sitio);
    solicitudApi = obtener(url, opciones);
    return solicitudApi;
  };

  dom.window.eval(codigo);

  assert.ok(solicitudApi, "No se consulto la API");

  const respuestaApi = await solicitudApi;

  assert.equal(
    respuestaApi.status,
    404,
    "En GitHub Pages no debe existir la API"
  );

  await esperar(100);

  assert.equal(
    seccion.hidden,
    true,
    "El libro debe permanecer oculto sin backend"
  );

  assert.ok(
    dom.window.document.querySelector("h1"),
    "La pagina principal dejo de funcionar"
  );

  console.log("OK: /api/mensajes devuelve 404 en Pages");
  console.log("OK: Libro de visitas oculto sin backend");
  console.log("POSTDEPLOY OK: Produccion validada");
}

ejecutar().catch((error) => {
  console.error("POSTDEPLOY FALLIDO:", error.message);
  process.exitCode = 1;
});