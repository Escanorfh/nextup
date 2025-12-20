import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-neutral-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-6xl font-extrabold text-neutral-900">404</div>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Page not found</h1>
        <p className="mt-2 text-neutral-600">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-white text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-white text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}

