import { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating, onRate, size = 'md', readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => !readonly && onRate(star)}
          className={`${(hovered || rating) >= star ? 'star-filled' : 'star-empty'} ${readonly ? 'cursor-default' : ''}`}
          data-testid={`star-${star}`}
        >
          <Star className={`${sizeClasses} ${(hovered || rating) >= star ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );
};
