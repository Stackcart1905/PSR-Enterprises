import { Link } from 'react-router-dom'

// Reusable brand logo component
// Props:
//  - to: route path (default '/')
//  - size: 'sm' | 'md' | 'lg'
//  - tagline: boolean to show secondary line
export default function Logo({ to = '/', size = 'md', tagline = false }) {
  const sizeMap = {
    sm: {
      grid: 'gap-0.5 p-0.5',
      square: 'w-2 h-2',
      title: 'text-base',
      tag: 'text-[9px]'
    },
    md: {
      grid: 'gap-0.5 p-1',
      square: 'w-2.5 h-2.5',
      title: 'text-lg',
      tag: 'text-[10px]'
    },
    lg: {
      grid: 'gap-1 p-1.5',
      square: 'w-3 h-3',
      title: 'text-2xl',
      tag: 'text-xs'
    }
  }
  const s = sizeMap[size] || sizeMap.md

  return (
    <Link to={to} className="flex items-center group select-none">
      <div className="mr-3">
        <div className={`grid grid-cols-2 ${s.grid} bg-white rounded-md shadow-sm ring-1 ring-green-200 group-hover:ring-green-400 transition-all`}>
          <span className={`${s.square} bg-green-600 rounded-sm`}></span>
          <span className={`${s.square} bg-yellow-500 rounded-sm`}></span>
            <span className={`${s.square} bg-orange-500 rounded-sm`}></span>
          <span className={`${s.square} bg-red-500 rounded-sm`}></span>
        </div>
      </div>
      <div className="leading-tight">
        <div className={`${s.title} font-bold tracking-wide text-green-700 group-hover:text-green-800 transition-colors`}>PSR Enterprises</div>
        {tagline && (
          <div className={`${s.tag} uppercase font-medium text-green-500 tracking-wider`}>Premium Dry Fruits</div>
        )}
      </div>
    </Link>
  )
}
