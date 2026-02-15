import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-white/60" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={`${item.label}-${idx}`} className="flex items-center gap-2">
            {idx !== 0 && <ChevronRight size={14} className="text-white/40" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-white' : ''}>{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
