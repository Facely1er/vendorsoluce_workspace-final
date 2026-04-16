import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, FileText, Plus, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { MR, WR } from 'shared/constants/routes';

type Action = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

const actions: Action[] = [
  { label: 'Add vendor', href: WR.VENDOR_GRAPH_IMPORT, icon: UserPlus },
  { label: 'Start assessment', href: MR.SUPPLY_CHAIN_ASSESSMENT, icon: FileCheck },
  { label: 'Risk reports', href: MR.VENDOR_RISK_REPORTS, icon: FileText },
];

const QuickCreateMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!open) return;
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const onSelect = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <div ref={rootRef} className="relative flex items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="px-2.5"
        aria-haspopup="menu"
        {...(open ? { 'aria-expanded': 'true' as const } : { 'aria-expanded': 'false' as const })}
      >
        <Plus size={16} className="shrink-0" aria-hidden />
        <span className="hidden md:inline">New</span>
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50"
        >
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.href}
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
                onClick={() => onSelect(a.href)}
              >
                <Icon size={16} className="shrink-0 opacity-80" aria-hidden />
                <span className="truncate">{a.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickCreateMenu;
