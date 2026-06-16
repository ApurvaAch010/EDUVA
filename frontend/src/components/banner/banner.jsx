import { useState, useEffect, useCallback } from "react";
import "./banner.css";

export const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // const res = await fetch(`${import.meta.env.VITE_API_URL}/banners`);
        // const data = await res.json();
        // if (data.success) setBanners(data.data);
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

  const prev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
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
      <div
        className={`banner-slide ${transitioning ? "banner-slide--out" : "banner-slide--in"}`}
      >
        <img
          src={`${import.meta.env.VITE_API_URL}/${banner.image_path}`}
          alt={banner.title}
          className="banner-img"
        />
        <div className="banner-overlay" />
        <div className="banner-content">
          {banner.title && <h2 className="banner-title">{banner.title}</h2>}
          {banner.link && (
            <a href={banner.link} className="banner-cta">
              Shop now
            </a>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button className="banner-arrow banner-arrow--left" onClick={prev} aria-label="Previous">
            &#8592;
          </button>
          <button className="banner-arrow banner-arrow--right" onClick={next} aria-label="Next">
            &#8594;
          </button>

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
        </>
      )}
    </section>
  );
};