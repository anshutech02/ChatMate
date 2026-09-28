import axios from '../../api/axiosconfig';
import { setPresets, setLoading, DEFAULT_PRESETS } from '../reducers/contextSlice';

export const asyncLoadPresets = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.get('/api/context/presets', { withCredentials: true });
        if (res?.data?.presets && res.data.presets.length > 0) {
            dispatch(setPresets(res.data.presets));
        }
    } catch (error) {
        console.warn('Network load for context presets fell back to default presets:', error.message);
        // Ensure default presets remain in state
        dispatch(setPresets(DEFAULT_PRESETS));
    } finally {
        dispatch(setLoading(false));
    }
};
