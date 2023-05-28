const db = require("./index.js");

const getReviews = (page, count, sort, product_id) => {
  var order;

  // relevant/any string other than newest or helpful defaults to relevant so don't need it just rely on default
  switch (sort) {
    case "newest":
      order = "date";
      break;
    case "helpful":
      order = "helpfulness";
      break;
    default:
      order = "recommend";
  }

  var offset;
  if (page <= 1) {
    offset = 0;
  } else {
    offset = (page - 1) * count;
  }

  return db
    .query(
      `SELECT * FROM reviews WHERE product_id=${product_id} AND reported=false ORDER BY ${order} DESC LIMIT ${count} OFFSET ${offset};`
    )
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const getReviewPhotos = (review_id) => {
  return db
    .query(`SELECT * FROM reviews_photos WHERE review_id=${review_id}`)
    .then((photos) => {
      formattedPhotos = [];
      for (var i = 0; i < photos.rows.length; i++) {
        var photoObj = {
          id: photos.rows[i].id,
          url: photos.rows[i].url,
        };
        formattedPhotos.push(photoObj);
      }
      return formattedPhotos;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const formatReview = (review) => {
  var date = new Date(parseInt(review.date)).toISOString();

  var formattedReview = {
    review_id: review.id,
    rating: review.rating,
    summary: review.summary,
    recommend: review.recommend,
    response: review.response,
    body: review.body,
    date: date,
    reviewer_name: review.reviewer_name,
    helpfulness: review.helpfulness,
    photos: [],
  };

  return formattedReview;
};

const getReviewMetadata = (product_id) => {
  return db
    .query(
      `SELECT * FROM characteristic_reviews
      JOIN characteristics ON characteristics.id = characteristic_reviews.characteristic_id
      JOIN reviews ON reviews.id = characteristic_reviews.review_id
      WHERE characteristics.product_id = ${product_id};`
    )
    .then((data) => {
      var entry = data.rows;
      var ratings = {};
      var recommended = {};
      var characteristics = {};
      var seenReviews = {};

      for (var i = 0; i < entry.length; i++) {
        //only once for each review (multiple of same review_id exist across all entries due to schema design regarding characteristic_reviews)
        if (seenReviews[entry[i].review_id] == undefined) {
          seenReviews[entry[i].review_id] = true;

          // if 1, 2, 3, 4, or 5 is not property in rating, then add it, else, increment it
          if (ratings[entry[i].rating] == undefined) {
            ratings[entry[i].rating] = 1;
          } else {
            ratings[entry[i].rating]++;
          }

          // if true or false is not property in recommended, then add it, else, increment it
          if (recommended[entry[i].recommend] == undefined) {
            recommended[entry[i].recommend] = 1;
          } else {
            recommended[entry[i].recommend]++;
          }
        }

        if (characteristics[entry[i].name] == undefined) {
          characteristics[entry[i].name] = {
            id: entry[i].characteristic_id,
            value: [entry[i].value, 1],
          };
        } else {
          characteristics[entry[i].name].value[0] += entry[i].value;
          characteristics[entry[i].name].value[1]++;
        }
      }
      console.log(characteristics);

      for (var characteristic in characteristics) {
        characteristics[characteristic].value =
          characteristics[characteristic].value[0] /
          characteristics[characteristic].value[1];
      }

      return {
        product_id,
        ratings,
        recommended,
        characteristics,
      };
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const addReview = (
  product_id,
  rating,
  summary,
  body,
  recommend,
  name,
  email,
  photos,
  characteristics
) => {
  var date = new Date().getTime();
  return db
    .query(
      `INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
      VALUES (${product_id}, ${rating}, ${date}, '${summary}', '${body}', ${recommend}, false, '${name}', '${email}', null, 0)
      RETURNING id;`
    )
    .then((data) => {
      var review_id = data.rows[0].id;
      var characteristicInserts = [];
      var photoInserts = [];

      for (var characteristic in characteristics) {
        characteristicInserts.push(
          db.query(
            `INSERT INTO characteristic_reviews (characteristic_id, review_id, value)
            VALUES (${characteristic}, ${review_id}, ${characteristics[characteristic]});`
          )
        );
      }

      for (var i = 0; i < photos.length; i++) {
        photoInserts.push(
          db.query(
            `INSERT INTO reviews_photos (review_id, url) VALUES (${review_id}, '${photos[i]}');`
          )
        );
      }

      return Promise.all(characteristicInserts.concat(photoInserts))
        .then((data) => {
          return true;
        })
        .catch((err) => {
          console.error(err);
          return false;
        });
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
};

const markHelpful = (review_id) => {
  return db
    .query(
      `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${review_id};`
    )
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
};

const report = (review_id) => {
  return db
    .query(`UPDATE reviews SET reported = true WHERE id = ${review_id};`)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
};

module.exports = {
  getReviews,
  getReviewPhotos,
  formatReview,
  getReviewMetadata,
  addReview,
  markHelpful,
  report,
};
