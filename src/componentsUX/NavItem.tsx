import { forwardRef } from "react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { NavItemProps } from "../types/types";

const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(
  ({ icon: Icon, tooltip, to, onClick, badge, tooltipClassName }, ref) => {
    const content = (
      <div className="relative">
        <Icon className="w-6 h-6 stroke-1" />
        {badge !== undefined && badge > 0 && (
          <Badge className="absolute -top-2 -right-2" variant="destructive">
            {badge}
          </Badge>
        )}
      </div>
    );

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {to ? (
              <Link to={to}>{content}</Link>
            ) : (
              <button
                ref={ref}
                onClick={onClick}
                className="bg-transparent border-none p-0 cursor-pointer"
              >
                {content}
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent side="right" className={tooltipClassName}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

NavItem.displayName = "NavItem";

export default NavItem;
