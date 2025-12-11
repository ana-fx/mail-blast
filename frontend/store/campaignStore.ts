'use client'

import { create } from 'zustand'

import { BuilderBlock } from './builderStore'

interface Step1Data {
  title: string
  subject: string
  from_name: string
  from_email: string
  reply_to: string
}

interface Step2Data {
  content: string
  html_mode: boolean
  blocks?: BuilderBlock[]
}

interface Step3Data {
  contact_list_id?: string
  exclude_unsubscribed: boolean
  send_type: 'now' | 'later'
  send_at?: string
}

interface CampaignStore {
  step1Data: Step1Data
  step2Data: Step2Data
  step3Data: Step3Data
  currentStep: number
  setStep1Data: (data: Partial<Step1Data>) => void
  setStep2Data: (data: Partial<Step2Data>) => void
  setStep3Data: (data: Partial<Step3Data>) => void
  setCurrentStep: (step: number) => void
  reset: () => void
}

const initialStep1: Step1Data = {
  title: '',
  subject: '',
  from_name: '',
  from_email: '',
  reply_to: '',
}

const initialStep2: Step2Data = {
  content: '',
  html_mode: false,
  blocks: [],
}

const initialStep3: Step3Data = {
  contact_list_id: undefined,
  exclude_unsubscribed: true,
  send_type: 'now',
  send_at: undefined,
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  step1Data: initialStep1,
  step2Data: initialStep2,
  step3Data: initialStep3,
  currentStep: 1,
  setStep1Data: (data) => set((state) => ({ step1Data: { ...state.step1Data, ...data } })),
  setStep2Data: (data) => set((state) => ({ step2Data: { ...state.step2Data, ...data } })),
  setStep3Data: (data) => set((state) => ({ step3Data: { ...state.step3Data, ...data } })),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () => set({
    step1Data: initialStep1,
    step2Data: initialStep2,
    step3Data: initialStep3,
    currentStep: 1,
  }),
}))

