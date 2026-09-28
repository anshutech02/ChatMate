import { createSlice } from '@reduxjs/toolkit';

export const DEFAULT_PRESETS = [
    {
        id: 'default',
        label: 'General Assistant',
        description: 'A helpful, knowledgeable AI assistant for any task.',
        icon: '🤖',
        color: '#6366f1'
    },
    {
        id: 'formal_letter',
        label: 'Formal Letter Writer',
        description: 'Drafts professional letters, emails, and business correspondence.',
        icon: '📝',
        color: '#3b82f6'
    },
    {
        id: 'storytelling',
        label: 'English Storyteller',
        description: 'Crafts engaging narratives, stories, and creative writing.',
        icon: '📖',
        color: '#8b5cf6'
    },
    {
        id: 'code_review',
        label: 'Code Reviewer',
        description: 'Analyzes code for bugs, performance, and best practices.',
        icon: '💻',
        color: '#10b981'
    },
    {
        id: 'socratic_tutor',
        label: 'Socratic Tutor',
        description: 'Teaches through guided questions rather than direct answers.',
        icon: '🎓',
        color: '#f59e0b'
    },
    {
        id: 'debate_coach',
        label: 'Debate Coach',
        description: 'Helps build arguments, counterarguments, and rhetorical skills.',
        icon: '⚖️',
        color: '#ef4444'
    },
    {
        id: 'summarizer',
        label: 'Summarizer',
        description: 'Condenses long texts into clear, concise summaries.',
        icon: '📋',
        color: '#06b6d4'
    },
    {
        id: 'translator',
        label: 'Translator',
        description: 'Translates text and helps with language learning.',
        icon: '🌍',
        color: '#84cc16'
    },
    {
        id: 'eli5',
        label: 'ELI5 Explainer',
        description: "Explains complex concepts as if you're 5 years old.",
        icon: '👶',
        color: '#f97316'
    },
    {
        id: 'academic_writer',
        label: 'Academic Writer',
        description: 'Helps with research papers, essays, and scholarly writing.',
        icon: '🏛️',
        color: '#a855f7'
    }
];

const contextSlice = createSlice({
    name: 'context',
    initialState: {
        presets: DEFAULT_PRESETS,
        loading: false
    },
    reducers: {
        setPresets(state, action) {
            if (action.payload && action.payload.length > 0) {
                state.presets = action.payload;
            }
        },
        setLoading(state, action) {
            state.loading = action.payload;
        }
    }
});

export const { setPresets, setLoading } = contextSlice.actions;
export default contextSlice.reducer;
