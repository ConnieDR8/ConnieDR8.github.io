const request = require("supertest");
const { Pool } = require("pg");
const app = require("../app");

describe("GET /api/health", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Devuelve 200 cuando la base de datos responde", async () => {
    jest.spyOn(Pool.prototype, "query")
      .mockResolvedValue({ rows: [] });

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("Devuelve 503 cuando la base de datos falla", async () => {
    jest.spyOn(Pool.prototype, "query")
      .mockRejectedValue(new Error("Base de datos no disponible"));

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});