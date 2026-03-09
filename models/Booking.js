const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "pay_at_property"],
      default: "card"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending"
    },

    paymentReference: {
      type: String,
      default: null
    },

    totalNights: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
