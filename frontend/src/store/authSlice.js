import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true, // true on startup — waiting for /auth/me check
  },
  reducers: {
    // action 1 — called after successful login or /auth/me
    setUser: (state, action) => {
      state.user = action.payload; // payload = user object from backend
      state.isAuthenticated = true;
      state.loading = false;
    },
    // action 2 — called on logout or /auth/me failure
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    // action 3 — called while /auth/me is pending
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;