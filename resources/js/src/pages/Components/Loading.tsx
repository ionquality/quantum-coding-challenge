
const LoadingComponent = () => (
  <div role="status" className="flex items-center justify-center">
    <span className="animate-spin border-8 border-r-warning border-l-primary border-t-danger border-b-success rounded-full w-14 h-14 inline-block"></span>
    <span className="sr-only">Loading…</span>
  </div>
);

export default LoadingComponent;