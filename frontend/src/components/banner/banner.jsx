import { useState, useEffect, useCallback } from "react";
import "./banner.css";
import { getAllBannersApi } from "../../services/banner.service";

export const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await getAllBannersApi();
        if (res?.success) {
          setBanners(res.data.filter((b) => b.is_active === 1));
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const goTo = useCallback(
    (index) => {
      if (transitioning || index === current) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 400);
    },
    [current, transitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  // autoslide every 4s
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next, banners.length]);

  if (loading) {
    return <div className="banner-skeleton" />;
  }

  if (!banners.length) return null;

  const banner = banners[current];

return (
  <section className="banner">
    <div className={`banner-slide ${transitioning ? "banner-slide--out" : "banner-slide--in"}`}>
      
      {/* The background image that takes up the entire banner frame */}
      <img
        src={`${import.meta.env.VITE_API_URL}/${banner.image_path}`}
        alt={banner.title || "Banner display"}
        className="banner-bg-img"
      />
      
    
      <div className="banner-green-overlay" />

      {/* The text content positioned floating over the left side */}
      <div className="banner-content-overlay">
        {banner.title && <h2 className="banner-title">{banner.title}</h2>}
        {banner.description && <p className="banner-description">{banner.description}</p>}
        {banner.link && (
          <a href={banner.link} className="banner-cta">
            Shop Now
          </a>
        )}
      </div>

    </div>
    {banners.length > 1 && (
      <div className="banner-dots">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`banner-dot ${i === current ? "banner-dot--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    )}
  </section>
);
};