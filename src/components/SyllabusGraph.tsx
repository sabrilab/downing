import React, { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Objective } from '../types';

interface CustomNodeProps {
  data: { label: string };
}

function CustomNode({ data }: CustomNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-bold">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

interface Props {
  syllabus: {
    title: string;
    objectives: Objective[];
  };
}

export default function SyllabusGraph({ syllabus }: Props) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Helper function to generate random position within bounds
    const randomPosition = () => ({
      x: Math.random() * 800 - 400,
      y: Math.random() * 400 - 200,
    });
    
    // Add root node (syllabus title)
    nodes.push({
      id: 'root',
      type: 'custom',
      data: { label: syllabus.title },
      position: { x: 0, y: 0 },
    });
    
    const processObjective = (objective: Objective, parentId: string) => {
      const nodeId = objective.id;
      
      // Add node with random position
      nodes.push({
        id: nodeId,
        type: 'custom',
        data: { label: objective.content },
        position: randomPosition(),
      });
      
      // Add edge from parent
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'default',
        animated: true,
        style: { stroke: '#93c5fd' },
      });
      
      // Process sub-objectives
      objective.subObjectives.forEach((subObj) => {
        processObjective(subObj, nodeId);
      });
    };
    
    // Process all top-level objectives
    syllabus.objectives.forEach((obj) => {
      processObjective(obj, 'root');
    });
    
    return { nodes, edges };
  }, [syllabus]);
  
  return (
    <div className="w-full h-[800px] bg-gray-50 rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-blue-50/30"
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}