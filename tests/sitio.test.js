import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";

const SITIO = "_site";
let doc;
let html;

beforeAll(() => {
  html = readFileSync(`${SITIO}/index.html`, "utf8");
  doc = new JSDOM(html).window.document;
});

// B3: Cinco pruebas adaptadas del ejemplo del profesor
describe("Pruebas del ejemplo", () => {
  it("tiene un título", () => {
    expect(doc.title.trim()).not.toBe("");
  });

  it("muestra Connie Duran en el h1", () => {
    expect(doc.querySelector("h1")?.textContent)
      .toContain("Connie Duran");
  });

  it("todas las imágenes tienen texto alternativo", () => {
    const sinAlt = [...doc.querySelectorAll("img")]
      .filter((img) => !img.hasAttribute("alt"));

    expect(sinAlt).toHaveLength(0);
  });

  it("los archivos locales de la página existen", () => {
    const rutas = [
      ...doc.querySelectorAll(
        'script[src], link[rel="stylesheet"], img[src]'
      )
    ]
      .map((el) => el.getAttribute("src") ?? el.getAttribute("href"))
      .filter((ruta) => !/^(https?:)?\/\//.test(ruta));

    for (const ruta of rutas) {
      expect(
        existsSync(`${SITIO}/${ruta}`),
        `Falta el archivo ${ruta}`
      ).toBe(true);
    }
  });

  it("no publica archivos internos del repositorio", () => {
    for (const archivo of [
      "compose.yaml",
      ".env.example",
      "api",
      "db",
      "tests"
    ]) {
      expect(existsSync(`${SITIO}/${archivo}`)).toBe(false);
    }
  });
});

// B3: Cinco pruebas propias
describe("Pruebas propias del sitio", () => {
  it("contiene el formulario del libro de visitas", () => {
    const seccion = doc.querySelector("#libro-de-visitas");

    expect(seccion).not.toBeNull();
    expect(seccion.querySelector("form")).not.toBeNull();
    expect(seccion.querySelector('[name="nombre"]')).not.toBeNull();
    expect(seccion.querySelector('[name="mensaje"]')).not.toBeNull();
  });

  it("declara idioma, charset y viewport", () => {
    expect(doc.documentElement.lang).toBe("es");
    expect(doc.querySelector("meta[charset]")).not.toBeNull();
    expect(doc.querySelector('meta[name="viewport"]')).not.toBeNull();
  });

  it("tiene un solo encabezado h1", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("no contiene localhost ni rutas de Windows", () => {
    expect(html).not.toMatch(/localhost|127\.0\.0\.1/i);
    expect(html).not.toMatch(/file:\/\/\/|[A-Za-z]:\\/);
  });

  it("los enlaces de navegación apuntan a secciones existentes", () => {
    const enlaces = [...doc.querySelectorAll('nav a[href^="#"]')];

    expect(enlaces.length).toBeGreaterThan(0);

    for (const enlace of enlaces) {
      const destino = enlace.getAttribute("href").slice(1);

      expect(
        doc.getElementById(destino),
        `No existe la sección ${destino}`
      ).not.toBeNull();
    }
  });
});