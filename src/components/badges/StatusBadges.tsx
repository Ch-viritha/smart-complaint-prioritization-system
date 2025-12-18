import { UrgencyLevel, ComplaintStatus, ComplaintCategory } from '@/types/complaint';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Loader2,
  CheckCheck
} from 'lucide-react';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export const UrgencyBadge = ({ urgency, className }: UrgencyBadgeProps) => {
  const config = {
    critical: {
      label: 'Critical',
      icon: AlertTriangle,
      classes: 'bg-urgency-critical text-primary-foreground'
    },
    high: {
      label: 'High',
      icon: AlertCircle,
      classes: 'bg-urgency-high text-primary-foreground'
    },
    medium: {
      label: 'Medium',
      icon: Info,
      classes: 'bg-urgency-medium text-foreground'
    },
    low: {
      label: 'Low',
      icon: CheckCircle,
      classes: 'bg-urgency-low text-primary-foreground'
    },
  };

  const { label, icon: Icon, classes } = config[urgency];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
      classes,
      className
    )}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = {
    pending: {
      label: 'Pending',
      icon: Clock,
      classes: 'bg-status-pending text-primary-foreground'
    },
    in_progress: {
      label: 'In Progress',
      icon: Loader2,
      classes: 'bg-status-inprogress text-primary-foreground'
    },
    resolved: {
      label: 'Resolved',
      icon: CheckCheck,
      classes: 'bg-status-resolved text-primary-foreground'
    },
  };

  const { label, icon: Icon, classes } = config[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
      classes,
      className
    )}>
      <Icon className={cn('w-3 h-3', status === 'in_progress' && 'animate-spin')} />
      {label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: ComplaintCategory;
  className?: string;
}

export const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const labels: Record<ComplaintCategory, string> = {
    infrastructure: 'Infrastructure',
    public_safety: 'Public Safety',
    utilities: 'Utilities',
    sanitation: 'Sanitation',
    transportation: 'Transportation',
    health: 'Health',
    education: 'Education',
    other: 'Other'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      'bg-muted text-muted-foreground border border-border',
      className
    )}>
      {labels[category]}
    </span>
  );
};
