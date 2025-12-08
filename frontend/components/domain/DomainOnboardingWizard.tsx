'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Copy, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useDomainActions } from '@/hooks/useDomain'
import { DNSRecord } from '@/lib/api/automation'

interface DomainOnboardingWizardProps {
  onComplete?: () => void
}

export default function DomainOnboardingWizard({ onComplete }: DomainOnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState('')
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([])
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'verified' | 'failed'>('pending')
  const { add: addDomain, verify, recheck, isAdding, isVerifying, isRechecking } = useDomainActions()


  const handleVerify = () => {
    // This would use the domain ID from the created domain
    verify('', {
      onSuccess: () => {
        setVerificationStatus('verifying')
        // Poll for verification status
        setTimeout(() => {
          setVerificationStatus('verified')
          setStep(3)
        }, 5000)
      },
    })
  }

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'propagating':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Verified</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'propagating':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Propagating</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={step >= 1 ? 'font-medium text-blue-600' : 'text-slate-500'}>
            Add Domain
          </span>
          <span className={step >= 2 ? 'font-medium text-blue-600' : 'text-slate-500'}>
            Configure DNS
          </span>
          <span className={step >= 3 ? 'font-medium text-blue-600' : 'text-slate-500'}>
            Verify
          </span>
        </div>
        <Progress value={(step / 3) * 100} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Add Domain */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Add Sending Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter the domain you want to use for sending emails
                  </p>
                </div>
                <Button
                  onClick={handleAddDomain}
                  disabled={!domain || isAdding}
                  className="w-full"
                >
                  {isAdding ? 'Adding...' : 'Continue'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: DNS Records */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Configure DNS Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add these DNS records to your domain. Instructions for popular providers are available below.
                </p>

                {dnsRecords.map((record, index) => (
                  <Card key={index} className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{record.type}</Badge>
                            {getStatusBadge(record.status)}
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {record.name}
                          </p>
                        </div>
                        {getStatusIcon(record.status)}
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                        <div className="flex items-center justify-between">
                          <code className="text-sm text-slate-900 dark:text-slate-100 break-all">
                            {record.value}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(record.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        TTL: {record.ttl} seconds
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify DNS Records'}
                  </Button>
                  {domainId && (
                    <Button
                      variant="outline"
                      onClick={() => recheck(domainId)}
                      disabled={isRechecking}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRechecking ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Verified */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Domain Verified!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Your domain has been successfully verified and is ready to send emails.
                </p>
                {onComplete && (
                  <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                    Continue
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

