import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

export interface IconNodeData {
  icon: string;
  alt?: string;
}

export const IconNode: React.FC<NodeProps<IconNodeData>> = ({ data }) => {
  return (
    <div className="icon-node" aria-label={data.alt}>
      <img src={data.icon} alt="" />
      <span className="sr-only">{data.alt}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
