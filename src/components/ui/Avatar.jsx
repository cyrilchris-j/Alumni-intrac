import { getInitials } from '../../utils/formatters';

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
};

const Avatar = ({ src, name, size = 'md', className = '', onClick }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`rounded-full object-cover flex-shrink-0 ${sizeClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
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
      className={`rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 font-semibold text-primary-700 select-none ${sizeClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
