export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-700">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
      <h1 className="text-xl font-bold">Module Under Development</h1>
      <p className="text-slate-500">This feature is being finalized and will be available soon.</p>
    </div>
  );
}
