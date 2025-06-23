// src/components/StarRating.tsx
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  value: number;              // 0–10
  onChange: (newValue: number) => void;
  max?: number;               // default to 10
  size?: number;              // icon size in px
}

const StarRating: React.FC<StarRatingProps> = ({
                                                 value,
                                                 onChange,
                                                 max = 10,
                                                 size = 24
                                               }) => {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <FaStar
            key={i}
            size={size}
            style={{ cursor: 'pointer' }}
            color={filled ? '#FFC107' : '#E4E5E9'}
            onClick={() => {
              const newVal = (i + 1 === value) ? 0 : i + 1;
              onChange(newVal);
            }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
