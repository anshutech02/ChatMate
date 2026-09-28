import React from 'react';
import PresetCardGrid from './PresetCardGrid';
import UploadContextCard from './UploadContextCard';

const ContextSelector = ({ selectedMode, customContext, onModeChange, onCustomContextChange }) => {
    return (
        <div className="flex flex-col gap-5 w-full">
            {/* Presets in card format */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Select Context Persona Card
                </p>
                <PresetCardGrid
                    selectedMode={selectedMode}
                    onSelectMode={onModeChange}
                />
            </div>

            {/* Custom Context Document Card */}
            <div>
                <UploadContextCard
                    customContext={customContext}
                    onCustomContextChange={onCustomContextChange}
                />
            </div>
        </div>
    );
};

export default ContextSelector;
