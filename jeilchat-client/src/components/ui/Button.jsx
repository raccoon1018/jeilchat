export default function Button({ children, onClick, className = '', variant = 'filled', color = 'blue', ...props }) {
  // ...기존 코드 그대로ㄴ
  // variant: 'filled' or 'outline'
  // color: 'blue', 'red', 'yellow' 등 Tailwind 색상 이름
  const base = "px-4 py-2 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition";
  const colors = {
    blue: variant === 'filled' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    red: variant === 'filled' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    yellow: variant === 'filled' ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus:ring-yellow-300' : 'border border-yellow-400 text-yellow-400 hover:bg-yellow-50 focus:ring-yellow-300',
    gray: variant === 'filled' ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500' : 'border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
  }
  const applied = colors[color] || colors.blue;
  return (
    <button
      onClick={onClick}
      className={`${base} ${applied} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
