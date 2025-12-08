'use client'

import { useRouter } from 'next/navigation'
import { Zap, Puzzle, Globe, Code, ExternalLink } from 'lucide-react'
import IntegrationCard from './IntegrationCard'
import ZapierIntegrationInfo from './ZapierIntegrationInfo'
import MakeIntegrationInfo from './MakeIntegrationInfo'
import CMSIntegrationGuides from './CMSIntegrationGuides'

export default function IntegrationGrid() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <IntegrationCard
        name="Zapier"
        description="Connect MailBlast with 6,000+ apps via Zapier"
        icon={<Zap className="h-6 w-6 text-slate-600 dark:text-slate-400" />}
        status="available"
        onConfigure={() => router.push('/integrations/zapier')}
      >
        <ZapierIntegrationInfo />
      </IntegrationCard>

      <IntegrationCard
        name="Make.com"
        description="Automate workflows with Make.com webhooks"
        icon={<Puzzle className="h-6 w-6 text-slate-600 dark:text-slate-400" />}
        status="available"
        onConfigure={() => router.push('/integrations/make')}
      >
        <MakeIntegrationInfo />
      </IntegrationCard>

      <IntegrationCard
        name="WordPress"
        description="WordPress plugin for easy integration"
        icon={<Globe className="h-6 w-6 text-slate-600 dark:text-slate-400" />}
        status="coming_soon"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          WordPress plugin coming soon
        </p>
      </IntegrationCard>

      <IntegrationCard
        name="Custom CMS"
        description="Integration guides for Webflow, custom CMS, and more"
        icon={<Code className="h-6 w-6 text-slate-600 dark:text-slate-400" />}
        status="available"
        onConfigure={() => router.push('/integrations/cms')}
      >
        <CMSIntegrationGuides />
      </IntegrationCard>
    </div>
  )
}

