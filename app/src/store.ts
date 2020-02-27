import { createSlice, configureStore } from '@reduxjs/toolkit';

import {
  getRelatedCases as _getRelatedCases,
  RelatedCasesResult,
} from './client';

export interface Case {
  num_litigants: number;
  description: string;
  title: string;
}

export interface AppState {
  activeStep: 0 | 1 | 2;
  relatedCases: RelatedCasesResult[] | null;
  subscribedCases: Case[];
  selectedCase: Case | null;
  scenario: string;
  userEmail: string | null;
}

const initialState: AppState = {
  activeStep: 0,
  relatedCases: null,
  subscribedCases: [
    {
      description: '',
      title: 'Baustellenlaerm im Hotel',
      num_litigants: 100,
    },
    {
      description: '',
      title: 'Robo Rasenmaeher kaputt',
      num_litigants: 35,
    },
  ],
  selectedCase: null,
  scenario: '',
  userEmail: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveStep(state, action) {
      state.activeStep = action.payload;
    },
    setSelectedCase(state, action) {
      state.selectedCase = action.payload;
    },
    setScenario(state, action) {
      state.scenario = action.payload;
    },
    addSubscribedCase(state, action) {
      state.subscribedCases.push(action.payload);
    },
    setRelatedCases(state, action) {
      state.relatedCases = action.payload;
    },
    setUserEmail(state, action) {
      state.userEmail = action.payload;
    },
  },
});

export const getRelatedCases = (queryString: string) => async (
  dispatch: any
) => {
  const cases = await _getRelatedCases(queryString);
  dispatch(appSlice.actions.setRelatedCases(cases));
};

export const {
  addSubscribedCase,
  setActiveStep,
  setSelectedCase,
  setScenario,
  setUserEmail,
} = appSlice.actions;

const store = configureStore({
  reducer: appSlice.reducer,
});

export default store;
