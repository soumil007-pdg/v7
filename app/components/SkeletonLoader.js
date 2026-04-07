'use client';
import { Skeleton } from '@/components/ui/skeleton';

// --- ChatSkeleton ---
export const ChatSkeleton = () => (
  <div className="space-y-3 w-full">
    <Skeleton className="h-3.5 w-[75%] bg-slate-200" />
    <Skeleton className="h-3.5 w-full bg-slate-200" />
    <Skeleton className="h-3.5 w-[60%] bg-slate-200" />
    <Skeleton className="h-3.5 w-[85%] bg-slate-200" />
    <div className="pt-2">
      <Skeleton className="h-3.5 w-[30%] bg-[#FF5B33]/20" />
    </div>
  </div>
);

// --- AnalysisSkeleton ---
export const AnalysisSkeleton = () => (
  <div className="space-y-5 w-full">
    <Skeleton className="h-4 w-[70%] bg-slate-200" />
    <Skeleton className="h-4 w-full bg-slate-200" />
    <Skeleton className="h-4 w-[85%] bg-slate-200" />
    <Skeleton className="h-4 w-full bg-slate-200" />
    <Skeleton className="h-28 w-full bg-slate-100 rounded-xl" />
    <Skeleton className="h-4 w-[90%] bg-slate-200" />
    <Skeleton className="h-4 w-[65%] bg-slate-200" />
    <div className="pt-1">
      <Skeleton className="h-4 w-[40%] bg-[#FF5B33]/20" />
    </div>
  </div>
);

// --- CitationSkeleton ---
export const CitationSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-lg border border-slate-100 p-3 bg-white space-y-2">
        <Skeleton className="h-3 w-[80%] bg-slate-200" />
        <Skeleton className="h-3 w-[55%] bg-slate-100" />
      </div>
    ))}
  </div>
);
