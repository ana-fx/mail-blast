'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CampaignDetailsForm from '@/components/campaign/CampaignDetailsForm'
import EmailContentEditor from '@/components/campaign/EmailContentEditor'
import AudienceScheduleForm from '@/components/campaign/AudienceScheduleForm'
import { useCampaignStore } from '@/store/campaignStore'
import { campaignsApi } from '@/lib/api/campaigns'

export default function CreateCampaignPage() {
  const router = useRouter()
  const { step1Data, step2Data, step3Data, currentStep, setCurrentStep, reset } = useCampaignStore()
  const [campaignId, setCampaignId] = useState<string | undefined>()

  const createMutation = useMutation({
    mutationFn: (data: any) => campaignsApi.create(data),
    onSuccess: (data) => {
      setCampaignId(data.id)
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create campaign')
    },
  })

  const scheduleMutation = useMutation({
    mutationFn: ({ id, sendNow }: { id: string; sendNow: boolean }) => {
      if (sendNow) {
        return campaignsApi.update(id, { status: 'sending' })
      } else {
        return campaignsApi.schedule(id, { send_at: step3Data.send_at! })
      }
    },
    onSuccess: () => {
      reset()
      router.push('/campaigns')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to schedule campaign')
    },
  })

  const handleStep1Next = () => {
    // Validate and move to next step
    if (!step1Data.title || !step1Data.subject || !step1Data.from_name || !step1Data.from_email || !step1Data.reply_to) {
      alert('Please fill in all required fields')
      return
    }
    setCurrentStep(2)
  }

  const handleStep2Next = () => {
    setCurrentStep(3)
  }

  const handleStep3Finish = (sendNow: boolean) => {
    // Create campaign with all data
    const campaignData = {
      title: step1Data.title,
      subject: step1Data.subject,
      content: step2Data.content || '',
      from_name: step1Data.from_name,
      from_email: step1Data.from_email,
      reply_to: step1Data.reply_to,
    }

    createMutation.mutate(campaignData, {
      onSuccess: (createdCampaign) => {
        const id = createdCampaign.id
        if (sendNow) {
          scheduleMutation.mutate({ id, sendNow: true })
        } else {
          if (!step3Data.send_at) {
            alert('Please select a date and time for scheduling')
            return
          }
          scheduleMutation.mutate({ id, sendNow: false })
        }
      },
    })
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      reset()
      router.push('/campaigns')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Campaign</h1>
        <p className="text-slate-600 mt-1">Step {currentStep} of 3</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-slate-900 text-white'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ${
                  step < currentStep ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <CampaignDetailsForm
            key="step1"
            onNext={handleStep1Next}
            onCancel={handleCancel}
          />
        )}
        {currentStep === 2 && (
          <EmailContentEditor
            key="step2"
            campaignId={campaignId}
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <AudienceScheduleForm
            key="step3"
            onFinish={handleStep3Finish}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

