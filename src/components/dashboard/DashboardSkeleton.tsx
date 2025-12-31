const DashboardSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Skeleton */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-48 bg-gray-100 rounded"></div>
          </div>

          {/* Recent Calls Skeleton */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
