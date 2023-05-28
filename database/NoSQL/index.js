const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/reviews");

const MOCKreviewSchema = new mongoose.Schema({
  review_id: Number,
  summary: String,
});

// const reviewSchema = new mongoose.Schema({
//   review_id: Number,
//   product_id: Number,
//   rating: Number,
//   date: Date,
//   summary: String,
//   body: String,
//   recommend: Boolean,
//   reported: Boolean,
//   reviewer_name: String,
//   reviewer_email: String,
//   response: String,
//   helpfulness: Number,
//   photos: String,
//   characteristics: {
//     size: Number,
//     width: Number,
//     comfort: Number,
//     quality: Number,
//     length: Number,
//     fit: Number,
//   },
// });

const Review = mongoose.model("Review", MOCKreviewSchema);

var save = (callback) => {
  var reviewDocument = new Review({
    review_id: 987654321,
    summary: "test",
  });
  reviewDocument.save().then(() => {
    callback();
  });
};

var get = (callback) => {
  Review.find().then((result) => {
    callback(result);
  });
};

module.exports.save = save;
module.exports.get = get;
