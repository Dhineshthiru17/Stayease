import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

export default function StarRating({ rating }) {

  const stars = [];

  for (let i = 1; i <= 5; i++) {

    if (rating >= i) {
      stars.push(<FaStar key={i} color="#f59e0b" />);
    }
    else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} color="#f59e0b" />);
    }
    else {
      stars.push(<FaRegStar key={i} color="#f59e0b" />);
    }

  }

  return (
    <div style={{display:"flex", gap:"3px"}}>
      {stars}
    </div>
  );

}