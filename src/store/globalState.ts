import { hookstate, useHookstate } from '@hookstate/core';

const initialState = hookstate({
    isLoggedIn: false,
    loading: false,
});

export const useGlobalState = () => {
    const state = useHookstate(initialState);

    return {
        isLoggedIn: () => state.isLoggedIn.value,
        isAppLoading: () => state.loading.value,
        showLoading: () => {
            state.loading.set(true);
        },
        hideLoading: () => {
            state.loading.set(false);
        },
        setIsLoggedIn: (loggedIn) => {
            state.isLoggedIn.set(loggedIn);
        },
    };
};
