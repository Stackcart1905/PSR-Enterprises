import React, { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ value = 0, onChange, interactive = false, size = 20 }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (rating) => {
        if (interactive && onChange) {
            onChange(rating);
        }
    };

    const handleMouseEnter = (rating) => {
        if (interactive) {
            setHoverRating(rating);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const currentValue = hoverRating || value;

    return (
        <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${star <= Math.round(currentValue)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } ${interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}`}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => handleMouseEnter(star)}
                />
            ))}
            {!interactive && value > 0 && (
                <span className="ml-2 font-medium text-gray-700">{value.toFixed(1)}</span>
            )}
        </div>
    );
};

export default StarRating;
