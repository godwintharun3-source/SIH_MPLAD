import React from 'react';
import { SearchX, FilterX } from 'lucide-react';

export const EmptyState = ({
  title = "No matching records found",
  description = "Try adjusting your search criteria or resetting the active filters.",
  onClearFilters = null
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6 shadow-2xs space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
        <SearchX className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-2 px-3.5 py-1.5 bg-gov-800 hover:bg-gov-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
