import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-slate-800 dark:text-slate-100 mb-4">404</h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </Link>
    </div>
  );
}
