import React from 'react';
import { Plus, Move } from 'lucide-react';
import * as THREE from 'three';

export const PosterControls = ({ onAddPoster, isEditing }) => {
  if (!isEditing) return null;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg space-y-4">
      <button
        onClick={() => onAddPoster({
          width: 1,
          height: 1.5,
          position: new THREE.Vector3(0, 2, 0.01)
        })}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Poster
      </button>

      <div className="p-4 border rounded-lg">
        <h4 className="text-sm font-medium mb-2">Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <Move className="w-4 h-4" />
            Drag posters to reposition
          </li>
          <li>Positions auto-save when released</li>
        </ul>
      </div>
    </div>
  );
};