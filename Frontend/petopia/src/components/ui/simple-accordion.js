"use client"

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = ({ children, type = "single", collapsible = false, className, ...props }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (value) => {
    if (type === "single") {
      setOpenItems((prev) => {
        // If collapsible is true, allow closing the item by clicking it again
        if (collapsible && prev[value]) {
          return {};
        }
        // Otherwise just open the clicked item and close others
        return {
          [value]: !prev[value],
        };
      });
    } else {
      setOpenItems((prev) => ({
        ...prev,
        [value]: !prev[value],
      }));
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isOpen: openItems[child.props.value] || false,
        onToggle: () => toggleItem(child.props.value),
      });
    }
    return child;
  });

  return <div className={className} {...props}>{childrenWithProps}</div>;
};

const AccordionItem = ({ children, value, isOpen, onToggle, className, ...props }) => {
  return (
    <div className={cn("border-b", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type.displayName === "AccordionTrigger") {
            return React.cloneElement(child, { isOpen, onToggle });
          }
          if (child.type.displayName === "AccordionContent") {
            return React.cloneElement(child, { isOpen });
          }
        }
        return child;
      })}
    </div>
  );
};
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = ({ children, className, isOpen, onToggle, ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4 font-medium transition-all hover:underline cursor-pointer",
        className
      )}
      onClick={onToggle}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </div>
  );
};
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = ({ children, className, isOpen, ...props }) => {
  if (!isOpen) return null;
  
  return (
    <div
      className={cn("overflow-hidden text-sm", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
