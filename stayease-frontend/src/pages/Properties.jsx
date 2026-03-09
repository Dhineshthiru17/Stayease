import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";
import StarRating from "../components/StarRating";

const formatInr = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    searchProperties();
  }, [location, minPrice, maxPrice]);

  const fetchProperties = async () => {
    try {
      const res = await API.get("/properties");
      setProperties(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const saveProperty = async (id) => {
    try {
      await API.post("/wishlist", { propertyId: id });
      showToast("Saved to wishlist", "success");
    } catch (error) {
      showToast(error.response?.data || "Error saving", "error");
    }
  };

  const searchProperties = async () => {
    try {
      const query = [];
      if (location) query.push(`location=${location}`);
      if (minPrice) query.push(`minPrice=${minPrice}`);
      if (maxPrice) query.push(`maxPrice=${maxPrice}`);

      const queryString = query.length ? `?${query.join("&")}` : "";
      const res = await API.get(`/properties${queryString}`);
      setProperties(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const clearFilters = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    fetchProperties();
  };

  return (
    <main className="page-shell">
      <h1 className="page-title">Find Your Next Stay</h1>
      <p className="page-subtitle">
        Browse verified properties, compare prices, and reserve in minutes.
      </p>

      <section className="panel" style={{ padding: "14px", marginTop: "18px" }}>
        <div className="search-row" style={{ margin: 0 }}>
          <input
            className="field"
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="field"
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input
            className="field"
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <button className="btn-secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </section>

      <section className="grid-cards" style={{ marginTop: "20px" }}>
        {properties.map((property) => (
          <article key={property._id} className="property-card">
            <div className="card-image-wrap">
              {property.image && (
                <img
                  src={property.image}
                  alt={property.title}
                  className="card-image"
                />
              )}

              <button
                className="icon-btn"
                onClick={() => saveProperty(property._id)}
                aria-label="Save property"
              ><span aria-hidden="true">&#10084;</span><span className="sr-only">Save</span></button>
            </div>

            <div className="card-body">
              <h3 className="card-title">{property.title}</h3>
              <p className="card-location">{property.location}</p>
              <p className="card-price">{formatInr(property.price)} / night</p>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StarRating rating={property.averageRating || 0} />
                <span className="muted">({property.totalReviews || 0})</span>
              </div>

              <div className="card-footer">
                <Link to={`/property/${property._id}`} style={{ width: "100%" }}>
                  <button className="btn" style={{ width: "100%" }}>
                    View details
                  </button>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

