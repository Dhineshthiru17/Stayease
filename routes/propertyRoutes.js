const router = require("express").Router();
const Property = require("../models/Property");
const Review = require("../models/Review");
const authMiddleware = require("../middleware/auth");

/*
===================================
CREATE PROPERTY (ADMIN)
===================================
*/
router.post("/", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const property = await Property.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(property);

  } catch (error) {
    res.status(500).json(error.message);
  }
});


/*
===================================
GET ALL PROPERTIES (SEARCH + RATINGS)
===================================
*/
router.get("/", async (req, res) => {

  try {

    const { location, minPrice, maxPrice } = req.query;

    let matchStage = {};

    // Location filter
    if (location) {
      matchStage.location = {
        $regex: location,
        $options: "i"
      };
    }

    // Price filter
    if (minPrice || maxPrice) {

      matchStage.price = {};

      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);

    }

    const properties = await Property.aggregate([

      { $match: matchStage },

      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "property",
          as: "reviews"
        }
      },

      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" }
        }
      },

      {
        $addFields: {
          averageRating: {
            $ifNull: [{ $round: ["$averageRating", 1] }, 0]
          }
        }
      }

    ]);

    res.json(properties);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


/*
===================================
GET SINGLE PROPERTY
===================================
*/
router.get("/:id", async (req, res) => {

  try {

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json("Property not found");
    }

    res.json(property);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


/*
===================================
UPDATE PROPERTY (ADMIN)
===================================
*/
router.put("/:id", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!property) {
      return res.status(404).json("Property not found");
    }

    res.json(property);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


/*
===================================
DELETE PROPERTY (ADMIN)
===================================
*/
router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json("Property not found");
    }

    res.json("Property deleted successfully");

  } catch (error) {

    res.status(500).json(error.message);

  }

});

module.exports = router;