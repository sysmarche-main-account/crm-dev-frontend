import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lead: null,
  singleLeadDisplay: false,
};

const leadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    setLead: (state, action) => {
      state.lead = action.payload;
    },
    setSingleLeadDisplay: (state) => {
      state.singleLeadDisplay = !state.singleLeadDisplay;
    },
    resetLead: () => initialState,
  },
});

export const { setLead, setSingleLeadDisplay, resetLead } = leadSlice.actions;
export default leadSlice.reducer;
