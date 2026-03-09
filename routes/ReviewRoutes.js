const router = require("express").Router();
const Review = require("../models/Review");
const auth = require("../middleware/auth");

/*
   CREATE REVIEW (One review per user per property)
*/
router.post("/", auth, async (req, res) => {

  try {

    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !rating || !comment) {
      return res.status(400).json("All fields are required");
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      user: req.user.id,
      property: propertyId
    });

    if (existingReview) {
      return res.status(400).json("You already reviewed this property");
    }

    const review = await Review.create({
      user: req.user.id,
      property: propertyId,
      rating,
      comment
    });

    res.status(201).json(review);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


/*
   GET REVIEWS FOR A PROPERTY
*/
router.get("/:propertyId", async (req, res) => {

  try {

    const reviews = await Review.find({
      property: req.params.propertyId
    }).populate("user", "name");

    res.json(reviews);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


module.exports = router;