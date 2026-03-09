import { useEffect, useState } from "react";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";

const formatInr = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await API.get("/properties");
      setProperties(res.data);
    } catch (error) {
      console.log(error);
      showToast("Failed to load properties", "error");
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async () => {
    if (!title.trim() || !location.trim() || !price || !description.trim()) {
      showToast("Please fill title, location, price and description", "warning");
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/properties", {
        title: title.trim(),
        location: location.trim(),
        price,
        image: image.trim(),
        description: description.trim()
      });

      showToast("Property added successfully", "success");
      setTitle("");
      setLocation("");
      setPrice("");
      setImage("");
      setDescription("");
      fetchProperties();
    } catch (error) {
      showToast(error.response?.data || "Error adding property", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProperty = async (id) => {
    const confirmed = window.confirm("Delete this property listing?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await API.delete(`/properties/${id}`);
      showToast("Property deleted", "success");
      fetchProperties();
    } catch (error) {
      showToast(error.response?.data || "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page-shell">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Create and manage property listings from one place.</p>

      <section className="panel" style={{ marginTop: "18px", padding: "18px" }}>
        <h2 style={{ marginTop: 0 }}>Add New Property</h2>

        <div
          style={{
            display: "grid",
            gap: "10px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
          }}
        >
          <input
            className="field"
            placeholder="Property title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="field"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="field"
            type="number"
            placeholder="Price per night"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="field"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        <textarea
          className="textarea"
          placeholder="Property description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginTop: "10px" }}
        />

        <button className="btn" onClick={addProperty} disabled={submitting}>
          {submitting ? "Adding property..." : "Add property"}
        </button>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2 style={{ marginBottom: "12px" }}>All Listings</h2>

        {loading ? (
          <p>Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="muted">No properties added yet.</p>
        ) : (
          <div className="grid-cards">
            {properties.map((property) => (
              <article key={property._id} className="property-card">
                {property.image ? (
                  <img className="card-image" src={property.image} alt={property.title} />
                ) : (
                  <div
                    style={{
                      height: "210px",
                      display: "grid",
                      placeItems: "center",
                      color: "#6b7280",
                      background: "#f3f6fb"
                    }}
                  >
                    No image
                  </div>
                )}

                <div className="card-body">
                  <h3 className="card-title">{property.title}</h3>
                  <p className="card-location">{property.location}</p>
                  <p className="card-price">{formatInr(property.price)} / night</p>
                  <p className="muted" style={{ margin: "0 0 12px" }}>
                    {property.description}
                  </p>

                  <button
                    className="btn-danger"
                    onClick={() => deleteProperty(property._id)}
                    disabled={deletingId === property._id}
                  >
                    {deletingId === property._id ? "Deleting..." : "Delete property"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
