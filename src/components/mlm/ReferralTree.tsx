
import { ReferralTreeNode, User } from '@/lib/types';
import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferralTreeProps {
  data: ReferralTreeNode[];
  level?: number;
  showControls?: boolean;
  onUserClick?: (user: User) => void;
}

export default function ReferralTree({ 
  data, 
  level = 0, 
  showControls = true,
  onUserClick 
}: ReferralTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const expandAll = () => {
    const allNodes = new Set<string>();
    const collectNodeIds = (nodes: ReferralTreeNode[]) => {
      nodes.forEach(node => {
        allNodes.add(node.user.id);
        if (node.children.length > 0) {
          collectNodeIds(node.children);
        }
      });
    };
    collectNodeIds(data);
    setExpandedNodes(allNodes);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No referral data available.
      </div>
    );
  }

  return (
    <div className="animate-slideUp">
      {showControls && (
        <div className="flex justify-end space-x-4 mb-4">
          <button 
            className="text-sm text-mlm-primary hover:text-mlm-accent"
            onClick={expandAll}
          >
            Expand All
          </button>
          <button 
            className="text-sm text-mlm-primary hover:text-mlm-accent"
            onClick={collapseAll}
          >
            Collapse All
          </button>
        </div>
      )}
      
      <ul className="space-y-2">
        {data.map((node) => (
          <li key={node.user.id} className="animate-fadeIn">
            <div 
              className={cn(
                "flex items-center p-2 rounded-md",
                level === 0 ? "bg-mlm-primary/10" : level % 2 === 0 ? "bg-background" : "bg-card"
              )}
            >
              {node.children.length > 0 && (
                <button
                  className="mr-2 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleNode(node.user.id)}
                >
                  {expandedNodes.has(node.user.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              
              {node.children.length === 0 && <span className="w-6" />}
              
              <div 
                className={cn(
                  "flex items-center flex-1 cursor-pointer",
                  onUserClick ? "hover:text-mlm-primary" : ""
                )}
                onClick={onUserClick ? () => onUserClick(node.user) : undefined}
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="font-medium">{node.user.name}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">Level {node.user.level}</span>
                {node.children.length > 0 && (
                  <span className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {node.children.length} referrals
                  </span>
                )}
              </div>
            </div>
            
            {node.children.length > 0 && expandedNodes.has(node.user.id) && (
              <div className="pl-6 mt-2 border-l-2 border-dashed border-mlm-primary/20">
                <ReferralTree 
                  data={node.children} 
                  level={level + 1} 
                  showControls={false}
                  onUserClick={onUserClick}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
