const router = require("express").Router();
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const authMiddleware = require("../middleware/auth");

const PAYMENT_METHODS = ["card", "upi", "netbanking", "wallet", "pay_at_property"];

const generatePaymentReference = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${Date.now()}-${random}`;
};

const calculateNights = (start, end) => {
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end - start) / msInDay);
};

// ================================
// GET UNAVAILABLE DATES (Public)
// ================================
router.get("/availability/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json("Property ID is required");
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json("Property not found");
    }

    const bookings = await Booking.find({
      property: propertyId,
      status: { $ne: "cancelled" }
    })
      .select("startDate endDate")
      .sort({ startDate: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ================================
// CREATE BOOKING (User)
// ================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { propertyId, startDate, endDate, paymentMethod = "card" } = req.body;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json("Property, check-in and check-out are required");
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json("Invalid payment method");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json("Start date cannot be in the past");
    }

    if (end <= start) {
      return res.status(400).json("End date must be after start date");
    }

    const totalNights = calculateNights(start, end);
    if (totalNights < 1) {
      return res.status(400).json("Minimum stay is 1 night");
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json("Property not found");
    }

    const conflictingBooking = await Booking.findOne({
      property: propertyId,
      status: { $ne: "cancelled" },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (conflictingBooking) {
      return res.status(400).json("Property already booked for selected dates");
    }

    const totalAmount = Number(property.price) * totalNights;
    const isPayAtProperty = paymentMethod === "pay_at_property";

    const booking = await Booking.create({
      user: req.user.id,
      property: propertyId,
      startDate,
      endDate,
      status: isPayAtProperty ? "pending" : "confirmed",
      paymentMethod,
      paymentStatus: isPayAtProperty ? "pending" : "paid",
      paymentReference: isPayAtProperty ? null : generatePaymentReference(),
      totalNights,
      totalAmount
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ================================
// MARK PAYMENT AS COMPLETED (User)
// ================================
router.put("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod = "card" } = req.body;

    if (!["card", "upi", "netbanking", "wallet"].includes(paymentMethod)) {
      return res.status(400).json("Choose a valid online payment method");
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json("Booking not found");
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json("Access denied");
    }

    if (booking.status === "cancelled") {
      return res.status(400).json("Cannot pay for a cancelled booking");
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json("Booking is already paid");
    }

    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "paid";
    booking.paymentReference = generatePaymentReference();
    booking.status = "confirmed";

    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ================================
// GET MY BOOKINGS (User)
// ================================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("property")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ================================
// GET ALL BOOKINGS (Admin)
// ================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const bookings = await Booking.find()
      .populate("property")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ================================
// UPDATE BOOKING STATUS (Admin)
// ================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json("Invalid status value");
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json("Booking not found");
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ================================
// CANCEL BOOKING (User)
// ================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json("Booking not found");
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json("Access denied");
    }

    if (booking.status === "cancelled") {
      return res.status(400).json("Booking is already cancelled");
    }

    booking.status = "cancelled";

    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    res.json("Booking cancelled successfully");
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
