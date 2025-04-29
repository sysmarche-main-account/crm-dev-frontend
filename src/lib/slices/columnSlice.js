import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  defaultSet: {
    leads: [
      { id: 1, label: "Lead Name", checked: true, disabled: true },
      { id: 2, label: "Stage", checked: true },
      // { id: 7, label: "Mobile Number", checked: true },
      { id: 3, label: "Course", checked: true },
      { id: 4, label: "University", checked: true },
      { id: 5, label: "Owner", checked: true },
      { id: 6, label: "Modified on", checked: true },
      // { id: 8, label: "Contact", checked: false },
      // { id: 9, label: "Email", checked: false },
      // { id: 10, label: "Sub-stage", checked: false },
      // { id: 11, label: "Lead Source", checked: false },
      // { id: 12, label: "Source medium", checked: true },
      // { id: 13, label: "Created on", checked: false },
      // { id: 14, label: "Lead age", checked: false },
      // { id: 15, label: "Modified age", checked: false },
      // { id: 16, label: "Next follow up", checked: false },
      // { id: 17, label: "Preferred time to call", checked: false },
      // { id: 18, label: "Remark", checked: false },
    ],
    followups: [
      { id: 1, label: "Lead Name", checked: true, disabled: true },
      { id: 2, label: "Created Date", checked: true },
      { id: 3, label: "Follow-up Mode", checked: true },
      { id: 4, label: "Description", checked: true },
      { id: 5, label: "Follow-up Date", checked: true },
      { id: 6, label: "Modified on", checked: true },
    ],
    user: [
      { id: 1, label: "User Name", checked: true, disabled: true },
      { id: 2, label: "Email", checked: true },
      { id: 3, label: "Mobile No.", checked: true },
      { id: 4, label: "Reporting To", checked: true },
      { id: 5, label: "University Name", checked: true },
      { id: 6, label: "Created By", checked: true },
    ],
    roles: [
      { id: 1, label: "Role Name", checked: true, disabled: true },
      { id: 2, label: "Description", checked: true },
      { id: 3, label: "Status", checked: true },
    ],
    role_map: [
      { id: 1, label: "Assigned Role", checked: true, disabled: true },
      { id: 2, label: "No. of users assigned", checked: true },
    ],
    email_template: [
      { id: 1, label: "Template Name", checked: true, disabled: true },
      { id: 2, label: "Subject", checked: true },
      { id: 3, label: "Status", checked: true },
      { id: 4, label: "Visibility", checked: true },
    ],
    sms_template: [
      { id: 1, label: "Template Name", checked: true, disabled: true },
      { id: 2, label: "SMS body", checked: true },
      { id: 4, label: "Visibility", checked: true },
    ],
    whatsapp_template: [
      { id: 1, label: "Template Name", checked: true, disabled: true },
      { id: 2, label: "Body", checked: true },
      { id: 4, label: "Visibility", checked: true },
    ],
    rules: [
      { id: 1, label: "Assignment Rule", checked: true, disabled: true },
      { id: 2, label: "University", checked: true },
      { id: 3, label: "Source", checked: true },
      { id: 4, label: "Course", checked: true },
      { id: 5, label: "Assigned Counsellors", checked: true },
      { id: 6, label: "Status", checked: true },
    ],
  },
  userSet: null,
};

const columnSlice = createSlice({
  name: "column",
  initialState,
  reducers: {
    setUserFull: (state) => {
      state.userSet = JSON.parse(JSON.stringify(state.defaultSet));
    },
    setUserSet: (state, action) => {
      if (!state.userSet) state.userSet = {};
      state.userSet[action.payload.table] = action.payload.data;
    },
    resetColumns: () => ({ ...initialState }), // Creates a new instance
  },
});

export const { setUserFull, setUserSet, resetColumns } = columnSlice.actions;
export default columnSlice.reducer;
