import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loadingState: false,
  loadingFollowup: false,
  loadingCall: false,
  reporting: [],
  start: null,
  end: null,
  data: null,
  callData: null,
  stage: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setLoadingState: (state, action) => {
      state.loadingState = action.payload;
    },
    setLoadingFollowup: (state, action) => {
      state.loadingFollowup = action.payload;
    },
    setLoadingCall: (state, action) => {
      state.loadingCall = action.payload;
    },
    setData: (state, action) => {
      state.data = action.payload;
    },
    setCallData: (state, action) => {
      state.callData = action.payload;
    },
    setReporting: (state, action) => {
      state.reporting = action.payload;
    },
    setStart: (state, action) => {
      state.start = action.payload;
    },
    setEnd: (state, action) => {
      state.end = action.payload;
    },
    setStage: (state, action) => {
      state.stage = action.payload;
    },
    resetDash: () => initialState,
  },
});

export const {
  setLoadingState,
  setLoadingFollowup,
  setLoadingCall,
  setData,
  setCallData,
  setReporting,
  setStart,
  setEnd,
  setStage,
  resetDash,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
