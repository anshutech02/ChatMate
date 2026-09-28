import React from 'react';
import { useSelector } from 'react-redux';
import { DEFAULT_PRESETS } from '../store/reducers/contextSlice';

const getCategoryForPreset = (id) => {
    switch (id) {
        case 'formal_letter':
            return { name: 'Writing', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
        case 'storytelling':
            return { name: 'Narrative', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
        case 'code_review':
            return { name: 'Development', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
        case 'socratic_tutor':
            return { name: 'Education', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
        case 'debate_coach':
            return { name: 'Rhetoric', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
        case 'summarizer':
            return { name: 'Productivity', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
        case 'translator':
            return { name: 'Languages', badge: 'bg-lime-500/10 text-lime-400 border-lime-500/30' };
        case 'eli5':
            return { name: 'Explainer', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
        case 'academic_writer':
            return { name: 'Academic', badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' };
        default:
            return { name: 'General', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    }
};

const PresetCardGrid = ({ selectedMode, onSelectMode }) => {
    const presetsFromStore = useSelector(state => state.contextReducer?.presets);
    const presets = (presetsFromStore && presetsFromStore.length > 0) ? presetsFromStore : DEFAULT_PRESETS;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
            {presets.map(preset => {
                const isSelected = selectedMode === preset.id;
                const { name: categoryName, badge: categoryBadge } = getCategoryForPreset(preset.id);
                const accentColor = preset.color || '#7c6aee';

                return (
                    <div
                        key={preset.id}
                        id={`preset-card-${preset.id}`}
                        onClick={() => onSelectMode(preset.id)}
                        className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-md ${
                            isSelected
                                ? 'bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-zinc-900/80 border-indigo-500/80 shadow-[0_0_24px_rgba(124,106,238,0.25)] scale-[1.01]'
                                : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-white/10 hover:border-white/20 hover:-translate-y-0.5 shadow-md'
                        }`}
                        style={isSelected ? { borderColor: accentColor } : {}}
                    >
                        {/* Selected Indicator Pill */}
                        {isSelected && (
                            <div
                                className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1 shadow-lg"
                                style={{ background: accentColor }}
                            >
                                <i className="ri-check-line font-bold" />
                                <span>Selected</span>
                            </div>
                        )}

                        {/* Top row: Icon and category badge */}
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border transition-transform duration-200 group-hover:scale-105"
                                style={{
                                    background: `${accentColor}18`,
                                    borderColor: `${accentColor}35`,
                                }}
                            >
                                {preset.icon}
                            </div>

                            {!isSelected && (
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${categoryBadge}`}>
                                    {categoryName}
                                </span>
                            )}
                        </div>

                        {/* Preset Name & Description */}
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                                {preset.label}
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                                {preset.description}
                            </p>
                        </div>

                        {/* Bottom action row */}
                        <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                            <span
                                className="font-semibold flex items-center gap-1.5 transition-colors"
                                style={{ color: isSelected ? accentColor : '#a1a1aa' }}
                            >
                                {isSelected ? (
                                    <>
                                        <i className="ri-checkbox-circle-fill text-sm" />
                                        <span>Active Context</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Click to Select</span>
                                        <i className="ri-arrow-right-line text-xs transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PresetCardGrid;
