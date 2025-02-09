import React from 'react';

export const PosterManagementUI = ({ isEditing, onStartEdit, onSave, onAddPoster, onCancel }) => {
    if (!isEditing) {
        return (
            <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                <button
                    onClick={onStartEdit}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Edit Posters
                </button>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg space-y-2">
            <button
                onClick={onAddPoster}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
                Add Poster
            </button>
            <button
                onClick={onSave}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Save Changes
            </button>
            <button
                onClick={onCancel}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
                Cancel
            </button>
        </div>
    );
};