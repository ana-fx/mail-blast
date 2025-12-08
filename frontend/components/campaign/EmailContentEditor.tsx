'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCampaignStore } from '@/store/campaignStore'
import SendTestModal from './SendTestModal'
import EmailPreviewModal from './EmailPreviewModal'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface EmailContentEditorProps {
  campaignId?: string
  onNext: () => void
  onBack: () => void
}

export default function EmailContentEditor({ campaignId, onNext, onBack }: EmailContentEditorProps) {
  const { step2Data, setStep2Data } = useCampaignStore()
  const [showTestModal, setShowTestModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Auto-save content
    const timer = setTimeout(() => {
      // Content is already in store
    }, 500)
    return () => clearTimeout(timer)
  }, [step2Data.content])

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step2Data.html_mode ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">HTML Content</label>
                <textarea
                  className="w-full h-96 rounded-md border border-slate-200 p-3 font-mono text-sm"
                  value={step2Data.content}
                  onChange={(e) => setStep2Data({ content: e.target.value })}
                  placeholder="<html>...</html>"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Content</label>
                {typeof window !== 'undefined' && (
                  <ReactQuill
                    theme="snow"
                    value={step2Data.content}
                    onChange={(value) => setStep2Data({ content: value })}
                    modules={quillModules}
                    className="bg-white"
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="html_mode"
                checked={step2Data.html_mode}
                onChange={(e) => setStep2Data({ html_mode: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="html_mode" className="text-sm text-slate-600">
                HTML Mode
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={onNext}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPreview(true)}
            >
              Preview Email
            </Button>
            {campaignId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowTestModal(true)}
              >
                Send Test Email
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>✓ Open tracking pixel will be added automatically</p>
            <p>✓ Click tracking will be enabled for all links</p>
            <p className="text-xs text-slate-500 mt-4">
              These features are handled by the backend automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      {showTestModal && campaignId && (
        <SendTestModal
          campaignId={campaignId}
          open={showTestModal}
          onClose={() => setShowTestModal(false)}
        />
      )}

      {showPreview && (
        <EmailPreviewModal
          content={step2Data.content}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </motion.div>
  )
}

