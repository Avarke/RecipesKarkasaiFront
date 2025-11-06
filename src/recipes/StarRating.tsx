interface StarRatingProps {
    rating: number; // e.g. 4.3
    max?: number;   // default = 5
    color?: string; // optional override
}

function StarRating({ rating, max = 5, color = "#ff7043" }: StarRatingProps) {
    const stars = [];

    for (let i = 1; i <= max; i++) {
        if (rating >= i) {
            // full star
            stars.push(<i key={i} className="bi bi-star-fill" style={{ color }}></i>);
        } else if (rating >= i - 0.5) {
            // half star
            stars.push(<i key={i} className="bi bi-star-half" style={{ color }}></i>);
        } else {
            // empty star
            stars.push(<i key={i} className="bi bi-star" style={{ color }}></i>);
        }
    }

    return (
        <span className="star-rating">
    {stars}
            <span style={{ marginLeft: "6px", color: "#555", fontSize: "0.9rem" }}>
      ({rating.toFixed(1)})
    </span>
  </span>
    );}

export default StarRating;
