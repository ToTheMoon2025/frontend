import React from 'react';
import { Edit } from 'lucide-react';

export const WallOverlayUI = ({ onEditWall }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3">
      <button
        onClick={() => onEditWall('back')}
        className="px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl"
      >
        <Edit className="w-4 h-4 text-blue-500" />
        <span>Edit Back Wall</span>
      </button>

      <button
        onClick={() => onEditWall('right')}
        className="px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl"
      >
        <Edit className="w-4 h-4 text-blue-500" />
        <span>Edit Right Wall</span>
      </button>
    </div>
  );
};
