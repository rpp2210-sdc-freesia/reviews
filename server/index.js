const express = require("express");
const config = require("../config.js");
const postgreSQL = require("../database/SQL/index.js");
const helpers = require("../database/SQL/helpers.js");
const {
  getReviews,
  getReviewPhotos,
  formatReview,
  getReviewMetadata,
  addReview,
  markHelpful,
  report,
} = helpers;

const app = express();

app.use(express.json());

app.get("/reviews", (req, res) => {
  var { page, count, sort, product_id } = req.query;
  page = page || 0;
  count = count || 5;
  sort = sort || "relevant";

  if (product_id == undefined) {
    res.sendStatus(500);
  }

  const tryGetReviews = async () => {
    try {
      var reviews = await getReviews(page, count, sort, product_id);
      var photos = [];
      reviews = reviews.map((review) => {
        photos.push(Promise.resolve(getReviewPhotos(review.id)));
        return formatReview(review);
      });
      await Promise.all(photos).then((data) => {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          if (data[i].length != 0) {
            reviews[i].photos = data[i];
          }
        }
      });
      var formattedResponse = {
        product: product_id,
        page: page,
        count: count,
        results: reviews,
      };

      res.status(200).send(formattedResponse);
    } catch (err) {
      console.error("Error", err);
      res.sendStatus(500);
    }
  };

  tryGetReviews();
});

app.get("/reviews/meta", (req, res) => {
  var { product_id } = req.query;
  const tryGetReviewMetaData = async () => {
    try {
      var metadata = await getReviewMetadata(product_id);
      res.status(200).send(metadata);
    } catch (err) {
      console.error("Error", err);
      res.sendStatus(500);
    }
  };

  tryGetReviewMetaData();
});

app.post("/reviews", (req, res) => {
  var {
    product_id,
    rating,
    summary,
    body,
    recommend,
    name,
    email,
    photos,
    characteristics,
  } = req.body;
  addReview(
    product_id,
    rating,
    summary,
    body,
    recommend,
    name,
    email,
    photos,
    characteristics
  ).then((successBool) => {
    if (successBool == true) {
      res.sendStatus(201);
    } else {
      res.sendStatus(500);
    }
  });
});

app.put("/reviews/:review_id/helpful", (req, res) => {
  var review_id = req.params.review_id;
  markHelpful(review_id).then((successBool) => {
    if (successBool == true) {
      res.sendStatus(204);
    } else {
      res.sendStatus(500);
    }
  });
});

app.put("/reviews/:review_id/report", (req, res) => {
  var review_id = req.params.review_id;
  report(review_id).then((successBool) => {
    if (successBool == true) {
      res.sendStatus(204);
    } else {
      res.sendStatus(500);
    }
  });
});

app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
  console.log(config.username);
});

module.exports = app;
