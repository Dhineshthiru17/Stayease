import { useEffect, useMemo, useState } from "react";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";

const STATUS_FILTERS = ["all", "upcoming", "past", "cancelled"];
const SORT_OPTIONS = [
  { value: "checkin-asc", label: "Check-in: Earliest first" },
  { value: "checkin-desc", label: "Check-in: Latest first" },
  { value: "created-desc", label: "Recently booked" }
];

const ONLINE_PAYMENT_OPTIONS = [
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Net Banking" },
  { value: "wallet", label: "Wallet" }
];

const formatInr = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

const prettyMethod = (method) => {
  if (!method) return "Not selected";
  if (method === "pay_at_property") return "Pay at Property";
  return method.charAt(0).toUpperCase() + method.slice(1);
};

const paymentStatusClass = (status) => {
  if (status === "paid") return "status-pill status-confirmed";
  if (status === "pending") return "status-pill status-pending";
  if (status === "refunded") return "status-pill status-refunded";
  return "status-pill status-cancelled";
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("checkin-asc");
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [payMethodByBooking, setPayMethodByBooking] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my");
      setBookings(res.data);

      const initialMethods = {};
      res.data.forEach((booking) => {
        initialMethods[booking._id] = "card";
      });
      setPayMethodByBooking(initialMethods);
    } catch (error) {
      console.log(error);
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const getBookingCategory = (booking) => {
    if (booking.status === "cancelled") return "cancelled";
    const now = new Date();
    const checkout = new Date(booking.endDate);
    return checkout < now ? "past" : "upcoming";
  };

  const filteredBookings = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const visible = bookings.filter((booking) => {
      const category = getBookingCategory(booking);
      if (statusFilter !== "all" && category !== statusFilter) return false;

      if (!query) return true;
      const title = booking.property?.title?.toLowerCase() || "";
      const location = booking.property?.location?.toLowerCase() || "";
      return title.includes(query) || location.includes(query);
    });

    visible.sort((a, b) => {
      if (sortBy === "checkin-desc") return new Date(b.startDate) - new Date(a.startDate);
      if (sortBy === "created-desc") return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.startDate) - new Date(b.startDate);
    });

    return visible;
  }, [bookings, statusFilter, searchText, sortBy]);

  const cancelBooking = async (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      setCancellingId(id);
      await API.delete(`/bookings/${id}`);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                status: "cancelled",
                paymentStatus:
                  booking.paymentStatus === "paid" ? "refunded" : booking.paymentStatus
              }
            : booking
        )
      );
      showToast("Booking cancelled", "success");
    } catch (error) {
      console.log(error);
      showToast(error.response?.data || "Cancel failed", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const payNow = async (bookingId) => {
    try {
      setPayingId(bookingId);

      const method = payMethodByBooking[bookingId] || "card";
      const res = await API.put(`/bookings/${bookingId}/pay`, {
        paymentMethod: method
      });

      setBookings((prev) =>
        prev.map((booking) => (booking._id === bookingId ? res.data : booking))
      );

      showToast("Payment completed successfully", "success");
    } catch (error) {
      showToast(error.response?.data || "Payment failed", "error");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <main className="page-shell">
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">Track upcoming trips, payments, and cancellations.</p>

      <section className="panel" style={{ padding: "14px", marginTop: "18px" }}>
        <div className="search-row" style={{ margin: 0, gridTemplateColumns: "minmax(220px,1.4fr) repeat(2,minmax(140px,0.9fr))" }}>
          <input
            className="field"
            type="text"
            placeholder="Search property or location"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </option>
            ))}
          </select>

          <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <p style={{ marginTop: "18px" }}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p style={{ marginTop: "18px" }}>No bookings found.</p>
      ) : filteredBookings.length === 0 ? (
        <p style={{ marginTop: "18px" }}>No bookings match your current filters.</p>
      ) : (
        <>
          <p className="muted" style={{ marginTop: "16px" }}>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>

          <section className="grid-cards" style={{ marginTop: "10px" }}>
            {filteredBookings.map((booking) => {
              const isCancelled = booking.status === "cancelled";
              const propertyTitle = booking.property?.title || "Property";
              const propertyLocation = booking.property?.location || "Location unavailable";
              const propertyImage = booking.property?.image;
              const statusClass =
                booking.status === "confirmed"
                  ? "status-pill status-confirmed"
                  : booking.status === "pending"
                    ? "status-pill status-pending"
                    : "status-pill status-cancelled";
              const needsPayment = booking.paymentStatus === "pending" && !isCancelled;

              return (
                <article key={booking._id} className="booking-card">
                  {propertyImage && <img src={propertyImage} alt={propertyTitle} className="card-image" />}

                  <div className="card-body">
                    <h3 className="card-title">{propertyTitle}</h3>
                    <p className="card-location">{propertyLocation}</p>

                    <p style={{ margin: "8px 0 4px" }}>
                      <strong>Check-in:</strong> {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                    <p style={{ margin: "0 0 8px" }}>
                      <strong>Check-out:</strong> {new Date(booking.endDate).toLocaleDateString()}
                    </p>

                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Total:</strong> {formatInr(booking.totalAmount || 0)} ({booking.totalNights || 0} nights)
                    </p>
                    <p style={{ margin: "0 0 10px" }}>
                      <strong>Payment method:</strong> {prettyMethod(booking.paymentMethod)}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <span className={statusClass}>{booking.status}</span>
                      <span className={paymentStatusClass(booking.paymentStatus)}>
                        payment: {booking.paymentStatus || "pending"}
                      </span>
                    </div>

                    {booking.paymentReference && (
                      <p className="muted" style={{ margin: "10px 0 0", fontSize: "0.83rem" }}>
                        Ref: {booking.paymentReference}
                      </p>
                    )}

                    <div className="card-footer" style={{ flexDirection: "column", alignItems: "stretch" }}>
                      {needsPayment && (
                        <>
                          <select
                            className="select"
                            value={payMethodByBooking[booking._id] || "card"}
                            onChange={(e) =>
                              setPayMethodByBooking((prev) => ({
                                ...prev,
                                [booking._id]: e.target.value
                              }))
                            }
                          >
                            {ONLINE_PAYMENT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <button
                            className="btn"
                            onClick={() => payNow(booking._id)}
                            disabled={payingId === booking._id}
                          >
                            {payingId === booking._id ? "Processing payment..." : "Pay now"}
                          </button>
                        </>
                      )}

                      {!isCancelled && (
                        <button
                          className="btn-danger"
                          onClick={() => cancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                        >
                          {cancellingId === booking._id ? "Cancelling..." : "Cancel booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
