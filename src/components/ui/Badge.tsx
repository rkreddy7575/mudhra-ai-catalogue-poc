interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-surface-100 text-surface-600',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Maps enquiry status to badge variant */
export function statusBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'new':
      return 'info';
    case 'contacted':
      return 'warning';
    case 'quoted':
      return 'success';
    case 'closed':
      return 'default';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
}
