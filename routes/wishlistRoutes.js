const router = require("express").Router();
const Wishlist = require("../models/Wishlist");
const auth = require("../middleware/auth");


// ADD TO WISHLIST
router.post("/", auth, async (req, res) => {

  try {

    const { propertyId } = req.body;

    const exists = await Wishlist.findOne({
      user: req.user.id,
      property: propertyId
    });

    if (exists) {
      return res.status(400).json("Already in wishlist");
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      property: propertyId
    });

    res.json(wishlist);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


// GET USER WISHLIST
router.get("/", auth, async (req, res) => {

  try {

    const list = await Wishlist.find({
      user: req.user.id
    }).populate("property");

    res.json(list);

  } catch (error) {

    res.status(500).json(error.message);

  }

});


// REMOVE FROM WISHLIST
router.delete("/:id", auth, async (req, res) => {

  try {

    await Wishlist.findByIdAndDelete(req.params.id);

    res.json("Removed from wishlist");

  } catch (error) {

    res.status(500).json(error.message);

  }

});

module.exports = router;