
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { FileQuestion } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-6">
        <FileQuestion size={64} className="text-slate-400" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-slate-500 max-w-md mb-8">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link to="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
};
