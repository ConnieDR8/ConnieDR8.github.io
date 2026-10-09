import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const BASE = process.env.INTEGRATION_URL || "http://127.0.0.1:8080";

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    signal: AbortSignal.timeout(5000),
  });

  const datos = await respuesta.json();

  return {
    estado: respuesta.status,
    datos,
  };
}

async function ejecutar() {
  const salud = await solicitar("/api/health");

  assert.equal(salud.estado, 200);
  assert.equal(salud.datos.status, "ok");
  console.log("OK: GET /api/health -> 200");

  const nombre = `Prueba-${randomUUID().slice(0, 8)}`;
  const mensaje = "Mensaje de integracion LAB-03";

  const creado = await solicitar("/api/mensajes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, mensaje }),
  });

  assert.equal(creado.estado, 201);
  assert.equal(creado.datos.nombre, nombre);
  assert.equal(creado.datos.mensaje, mensaje);
  console.log("OK: POST valido -> 201");

  const sinNombre = await solicitar("/api/mensajes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje }),
  });

  assert.equal(sinNombre.estado, 400);
  console.log("OK: POST sin nombre -> 400");

  const muyLargo = await solicitar("/api/mensajes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "Prueba",
      mensaje: "A".repeat(281),
    }),
  });

  assert.equal(muyLargo.estado, 400);
  console.log("OK: POST de 281 caracteres -> 400");

  const listado = await solicitar("/api/mensajes");

  assert.equal(listado.estado, 200);
  assert.ok(Array.isArray(listado.datos));

  assert.ok(
    listado.datos.some((item) =>
      item.nombre === nombre && item.mensaje === mensaje
    ),
    "El mensaje creado no aparece en el listado"
  );

  console.log("OK: GET /api/mensajes contiene el mensaje");
  console.log("INTEGRACION COMPLETA: 5 verificaciones correctas");
}

ejecutar().catch((error) => {
  console.error("INTEGRACION FALLIDA:", error.message);
  process.exitCode = 1;
});