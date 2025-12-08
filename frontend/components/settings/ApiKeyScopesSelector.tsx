'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ApiKeyScopesSelectorProps {
  availableScopes: string[]
  selectedScopes: string[]
  onChange: (scopes: string[]) => void
}

export default function ApiKeyScopesSelector({
  availableScopes,
  selectedScopes,
  onChange,
}: ApiKeyScopesSelectorProps) {
  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      onChange(selectedScopes.filter((s) => s !== scope))
    } else {
      onChange([...selectedScopes, scope])
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {availableScopes.map((scope) => {
              const isSelected = selectedScopes.includes(scope)
              return (
                <Badge
                  key={scope}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleScope(scope)}
                >
                  {scope}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedScopes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Selected Scopes ({selectedScopes.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedScopes.map((scope) => (
              <Badge key={scope} variant="default" className="gap-1">
                {scope}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toggleScope(scope)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

