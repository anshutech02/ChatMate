import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { asyncAddNewChat } from '../store/actions/chatAction';
import ContextSelector from './ContextSelector';

const NewChatModal = ({ onClose, onChatCreated, initialMode = 'default' }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [contextMode, setContextMode] = useState(initialMode);
    const [customContext, setCustomContext] = useState('');
    const [loading, setLoading] = useState(false);

    const presets = useSelector(state => state.contextReducer.presets);
    const selectedPreset = presets.find(p => p.id === contextMode) || presets[0];

    const handleCreate = async () => {
        const finalTitle = title.trim() || `${selectedPreset?.label || 'New'} Session`;
        setLoading(true);
        try {
            const newChat = await dispatch(asyncAddNewChat({
                title: finalTitle,
                contextMode,
                customContext
            }));
            if (newChat) {
                onChatCreated(newChat);
            }
            onClose();
        } catch (err) {
            console.error('Error creating chat:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0f0f1e] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-white"
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-chat-modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                            <i className="ri-chat-new-line" />
                        </div>
                        <div>
                            <h2 id="new-chat-modal-title" className="text-lg font-bold text-white tracking-tight">
                                Create Context Chat
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Configure persona cards and upload context documents.
                            </p>
                        </div>
                    </div>
                    <button
                        id="new-chat-modal-close"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-lg"
                        aria-label="Close modal"
                    >
                        <i className="ri-close-line" />
                    </button>
                </div>

                {/* Title Input */}
                <div>
                    <label htmlFor="new-chat-title-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Chat Title (Optional)
                    </label>
                    <input
                        id="new-chat-title-input"
                        type="text"
                        className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder={`e.g. ${selectedPreset?.label || 'General'} Discussion...`}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                        autoFocus
                    />
                </div>

                {/* Context Selector */}
                <ContextSelector
                    selectedMode={contextMode}
                    customContext={customContext}
                    onModeChange={setContextMode}
                    onCustomContextChange={setCustomContext}
                />

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                        id="new-chat-cancel-btn"
                        className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        id="new-chat-create-btn"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="ri-loader-4-line ri-spin" />
                                <span>Initializing...</span>
                            </>
                        ) : (
                            <>
                                <span>{selectedPreset?.icon}</span>
                                <span>Start Chat with {selectedPreset?.label}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
