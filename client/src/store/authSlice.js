import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearCredentials: () => initialState,
    },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;