// Skeleton shapes for loading states
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-border p-5 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="space-y-6">
    <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
    <div className="flex items-end gap-4 px-4 -mt-8">
      <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse border-4 border-white" />
      <div className="flex-1 space-y-2 pb-2">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
      </div>
    </div>
    <div className="px-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-white rounded-xl border border-border animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 bg-white rounded-xl border border-border animate-pulse" />
      <div className="h-64 bg-white rounded-xl border border-border animate-pulse" />
    </div>
  </div>
);

const Skeleton = ({ className = '', ...props }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} {...props} />
);

export default Skeleton;
