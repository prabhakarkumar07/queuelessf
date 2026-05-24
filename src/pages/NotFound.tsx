import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen ql-app-bg px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="ql-panel w-full p-5">
          <p className="ql-kicker">404</p>
          <h1 className="mt-2 text-2xl font-black text-stone-950">Page not found</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">This route is not available, or the page has moved.</p>
          <Link to="/dashboard" className="ql-btn-primary mt-5">Back to dashboard</Link>
        </section>
      </div>
    </div>
  );
}
