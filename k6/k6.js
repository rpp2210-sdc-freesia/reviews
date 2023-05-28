import http from "k6/http";
import { check } from "k6";

export var options = {
  scenarios: {
    constantRPS: {
      executor: "constant-arrival-rate",
      rate: 1000, // # requests
      timeUnit: "1s", // per second
      duration: "30s",
      preAllocatedVUs: 100,
      maxVUs: 1000,
    },
  },
};

export default () => {
  var random_product_id = Math.floor(Math.random() * (1000011 - 1)) + 1;
  const res = http.get(
    `http://localhost:3000/reviews?product_id=${random_product_id}`
  );
  check(res, { "returns 200 status code": (r) => r.status == 200 });
};
