import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  count: number;
  children?: React.ReactNode;
}

export function KanbanColumn({ title, count, children }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-sidebar/50 rounded-xl border border-border h-[calc(100vh-16rem)] overflow-hidden">
      {/* Column Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm tracking-wide text-foreground uppercase">
            {title}
          </h3>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Column Content / Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
