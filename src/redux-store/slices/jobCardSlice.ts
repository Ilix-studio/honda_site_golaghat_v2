import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export  interface JobCardUIState {
  activeJobCardId: string | null;
  activeInvoiceId: string | null;
  view: "list" | "create" | "detail" | "invoice";
}

const initialState: JobCardUIState = {
  activeJobCardId: null,
  activeInvoiceId: null,
  view: "list",
};

const jobCardSlice = createSlice({
  name: "jobCard",
  initialState,
  reducers: {
    setView(state, action: PayloadAction<JobCardUIState["view"]>) {
      state.view = action.payload;
    },
    selectJobCard(state, action: PayloadAction<string>) {
      state.activeJobCardId = action.payload;
      state.view = "detail";
    },
    openInvoice(state, action: PayloadAction<string>) {
      state.activeInvoiceId = action.payload;
      state.view = "invoice";
    },
    goBack(state) {
      if (state.view === "invoice") {
        state.view = "detail";
        state.activeInvoiceId = null;
      } else {
        state.view = "list";
        state.activeJobCardId = null;
        state.activeInvoiceId = null;
      }
    },
    reset(state) {
      state.view = "list";
      state.activeJobCardId = null;
      state.activeInvoiceId = null;
    },
  },
});

export const { setView, selectJobCard, openInvoice, goBack, reset } =
  jobCardSlice.actions;

export default jobCardSlice.reducer;