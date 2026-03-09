router.get("/", async (req, res) => {

  try {

    const { location, minPrice, maxPrice } = req.query;

    let filter = {};

    // Location filter
    if (location && location.trim() !== "") {
      filter.location = {
        $regex: location.trim(),
        $options: "i"
      };
    }

    // Price filter
    if (minPrice || maxPrice) {

      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);

    }

    console.log("Filter:", filter);   // DEBUG

    const properties = await Property.find(filter);

    res.json(properties);

  } catch (error) {

    res.status(500).json(error.message);

  }

}); 


router.post("/", auth, async (req, res) => {

  try {

    const { propertyId, startDate, endDate } = req.body;

    const existingBooking = await Booking.findOne({
      propertyId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json("Property already booked for these dates");
    }

    const booking = await Booking.create({
      userId: req.user.id,
      propertyId,
      startDate,
      endDate
    });

    res.status(201).json(booking);

  } catch (error) {

    res.status(500).json(error.message);

  }

});

router.get("/", auth, async (req, res) => {

  try {

    const bookings = await Booking.find({ user: req.user.id })
      .populate("property");

    res.json(bookings);

  } catch (error) {

    res.status(500).json(error.message);

  }

});