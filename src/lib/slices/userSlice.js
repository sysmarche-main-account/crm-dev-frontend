import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  details: null,
  permissions: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setDetails: (state, action) => {
      state.details = action.payload;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    resetUser: () => initialState,
  },
});

export const { setDetails, setPermissions, resetUser } = userSlice.actions;
export default userSlice.reducer;
