import { getInitials } from '../../utils/formatters';

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
};

const Avatar = ({ src, name, size = 'md', className = '', onClick, ring = false }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const ringClass = ring ? 'ring-2 ring-blue-400/60 ring-offset-2 ring-offset-white' : '';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`rounded-full object-cover flex-shrink-0 shadow-xs ${sizeClass} ${ringClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling?.style.removeProperty('display');
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 font-bold text-white select-none shadow-xs border border-white/40 ${sizeClass} ${ringClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;

