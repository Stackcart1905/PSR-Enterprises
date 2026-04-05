import { Link } from "react-router-dom";
import logo from "/logo.jpeg?url";

// Reusable brand logo component
// Props:
//  - to: route path (default '/')
//  - size: 'sm' | 'md' | 'lg'
//  - tagline: boolean to show secondary line
export default function Logo({ to = "/", size = "md", tagline = false }) {
  const sizeMap = {
    sm: {
      grid: "gap-0.5 p-0.5",
      square: "w-8 h-8",
      title: "text-base",
      tag: "text-[9px]",
    },
    md: {
      grid: "gap-0.5 p-1",
      square: "w-10 h-10",
      title: "text-lg",
      tag: "text-[10px]",
    },
    lg: {
      grid: "gap-1 p-1.5",
      square: "w-12 h-12",
      title: "text-2xl",
      tag: "text-xs",
    },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <Link to={to} className="flex items-center group select-none">
      <div className="mr-3">
        <div
          className={`grid ${s.grid} bg-white rounded-md shadow-sm transition-all`}
        >
          {/* fit the image within the grid */}

          <img src={logo} alt="Logo" className={`object-cover ${s.square}`} />
        </div>
      </div>
      <div className="leading-tight">
        <div
          className={`${s.title} font-bold tracking-wide text-green-700 group-hover:text-green-800 transition-colors`}
        >
          Swaadbhog Mewa Traders
        </div>
        {tagline && (
          <div
            className={`${s.tag} uppercase font-medium text-green-500 tracking-wider`}
          >
            Premium Quality Products
          </div>
        )}
      </div>
    </Link>
  );
}
