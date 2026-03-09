import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";
import StarRating from "../components/StarRating";

const formatInr = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

const toStartOfDay = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toDateOnlyString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PAYMENT_OPTIONS = [
  { value: "card", label: "Credit/Debit Card" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Net Banking" },
  { value: "wallet", label: "Wallet" },
  { value: "pay_at_property", label: "Pay at Property" }
];

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetchProperty();
    fetchReviews();
    fetchAvailability();
  }, [id]);

  const fetchProperty = async () => {
    const res = await API.get(`/properties/${id}`);
    setProperty(res.data);
  };

  const fetchReviews = async () => {
    const res = await API.get(`/reviews/${id}`);
    setReviews(res.data);
  };

  const fetchAvailability = async () => {
    try {
      const res = await API.get(`/bookings/availability/${id}`);
      setUnavailableRanges(res.data || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setUnavailableRanges([]);
    }
  };

  const isUnavailableDate = (date) => {
    const current = toStartOfDay(date);

    return unavailableRanges.some((booking) => {
      const start = toStartOfDay(booking.startDate);
      const end = toStartOfDay(booking.endDate);
      return current >= start && current < end;
    });
  };

  const nights = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    return Math.ceil((toStartOfDay(checkOut) - toStartOfDay(checkIn)) / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const totalAmount = useMemo(() => {
    if (!property || nights < 1) return 0;
    return Number(property.price) * nights;
  }, [property, nights]);

  const bookProperty = async () => {
    if (!checkIn || !checkOut) {
      showToast("Please select check-in and check-out dates", "warning");
      return;
    }

    if (checkOut <= checkIn) {
      showToast("Check-out must be after check-in", "warning");
      return;
    }

    try {
      setBookingLoading(true);

      const res = await API.post("/bookings", {
        propertyId: id,
        startDate: toDateOnlyString(checkIn),
        endDate: toDateOnlyString(checkOut),
        paymentMethod
      });

      if (res.data.paymentStatus === "paid") {
        showToast("Booking confirmed and payment completed", "success");
      } else {
        showToast("Booking created. You can pay later from My Bookings", "info");
      }

      setCheckIn(null);
      setCheckOut(null);
      setPaymentMethod("card");
      fetchAvailability();
    } catch (error) {
      showToast(error.response?.data || "Booking failed", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const submitReview = async () => {
    if (!rating || !comment.trim()) {
      showToast("Please add rating and review comment", "warning");
      return;
    }

    try {
      await API.post("/reviews", {
        propertyId: id,
        rating,
        comment
      });

      showToast("Review submitted", "success");
      setRating("");
      setComment("");
      fetchReviews();
    } catch (error) {
      showToast(error.response?.data || "Failed to submit review", "error");
    }
  };

  if (!property) {
    return (
      <main className="page-shell">
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <h1 className="page-title">{property.title}</h1>
      <p className="page-subtitle">{property.location}</p>

      <section className="gallery-grid" style={{ marginTop: "18px" }}>
        <img src={property.image} alt={property.title} className="gallery-main" />

        <div className="gallery-stack">
          <img src={property.image} alt={property.title} className="gallery-side" />
          <img src={property.image} alt={property.title} className="gallery-side" />
        </div>
      </section>

      <section className="details-layout">
        <div className="stack-column">
          <article className="panel" style={{ padding: "18px" }}>
            <h3 style={{ marginTop: 0 }}>About this place</h3>
            <p className="muted" style={{ lineHeight: 1.7 }}>{property.description}</p>
            <p style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 0 }}>
              {formatInr(property.price)} / night
            </p>
          </article>

          <article className="panel" style={{ padding: "18px" }}>
            <h3 style={{ marginTop: 0 }}>Reviews</h3>
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet.</p>
            ) : (
              <div className="stack-column">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card" style={{ padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <strong>{review.user?.name || "Guest"}</strong>
                      <StarRating rating={review.rating} />
                    </div>
                    <p style={{ marginBottom: 0 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel" style={{ padding: "18px" }}>
            <h3 style={{ marginTop: 0 }}>Leave a review</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <select
                className="select"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">Select rating</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>

              <textarea
                className="textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your stay experience"
              />

              <button className="btn" onClick={submitReview}>
                Submit review
              </button>
            </div>
          </article>
        </div>

        <aside className="panel" style={{ padding: "18px", height: "fit-content", position: "sticky", top: "95px" }}>
          <h3 style={{ marginTop: 0 }}>Reserve this property</h3>
          <p className="muted">Lock in your dates before availability changes.</p>

          <div className="reserve-form">
            <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Check-in</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (checkOut && date && checkOut <= date) {
                  setCheckOut(null);
                }
              }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              filterDate={(date) => !isUnavailableDate(date)}
              placeholderText="Select check-in"
              dateFormat="dd MMM yyyy"
              className="field"
            />

            <label style={{ fontWeight: 600, fontSize: "0.9rem", marginTop: "2px" }}>
              Check-out
            </label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
              filterDate={(date) => !isUnavailableDate(date) && (!checkIn || toStartOfDay(date) > toStartOfDay(checkIn))}
              placeholderText="Select check-out"
              dateFormat="dd MMM yyyy"
              className="field"
            />

            <label style={{ fontWeight: 600, fontSize: "0.9rem", marginTop: "2px" }}>
              Payment method
            </label>
            <select
              className="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {nights > 0 && (
              <div className="booking-summary-box">
                <p><strong>Nights:</strong> {nights}</p>
                <p><strong>Total:</strong> {formatInr(totalAmount)}</p>
              </div>
            )}

            <p className="availability-note">
              Unavailable dates are disabled in the calendar.
            </p>

            <button className="btn" style={{ width: "100%" }} onClick={bookProperty} disabled={bookingLoading}>
              {bookingLoading ? "Processing..." : "Reserve now"}
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
