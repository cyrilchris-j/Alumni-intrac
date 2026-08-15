import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mb-6 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
