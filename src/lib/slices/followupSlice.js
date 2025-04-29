import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: null,
  config: {},
  lead_id: null,
  lead_details: null,
  followup_id: null,
  comm_modal_display: false,
};

const followupSlice = createSlice({
  name: "followup",
  initialState,
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setConfig: (state, action) => {
      state.config = action.payload;
    },
    setLead_id: (state, action) => {
      state.lead_id = action.payload;
    },
    setLead_details: (state, action) => {
      state.lead_details = action.payload;
    },
    setComm_modal_display: (state) => {
      state.comm_modal_display = !state.comm_modal_display;
    },
    resetFollowup: () => initialState,
  },
});

export const {
  setMode,
  setConfig,
  setLead_id,
  setLead_details,
  setComm_modal_display,
  resetFollowup,
} = followupSlice.actions;
export default followupSlice.reducer;
