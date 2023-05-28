const req = require("supertest");
const server = require("../server/index.js");

describe("GET /reviews with product_id", () => {
  test("should return 200 status code", async () => {
    var res = await req(server).get("/reviews?product_id=1");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /reviews without product_id", () => {
  test("should return 500 status code", async () => {
    const res = await req(server).get("/reviews");
    expect(res.statusCode).toBe(500);
  });
});
