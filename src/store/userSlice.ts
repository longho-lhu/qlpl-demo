import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PublicUser } from "@/types/user";

interface UserState {
  user: PublicUser | null;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<PublicUser | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<PublicUser>>) => {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setUser, setUserLoading, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
