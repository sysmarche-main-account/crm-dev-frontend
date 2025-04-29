import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  expiry: null,
};

const bearerSlice = createSlice({
  name: "bearer",
  initialState,
  reducers: {
    setBearer: (state, action) => {
      state.token = action.payload;
    },
    setExpiry: (state, action) => {
      state.expiry = action.payload;
    },
    resetBearer: () => initialState,
  },
});

export const { setBearer, setExpiry, resetBearer } = bearerSlice.actions;
export default bearerSlice.reducer;
