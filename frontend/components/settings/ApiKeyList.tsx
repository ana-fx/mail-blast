'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Trash2, RotateCcw, MoreVertical, Eye, EyeOff } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ApiKey } from '@/lib/api/settings'
import { formatDateTime } from '@/lib/utils'
import { useApiKeyActions } from '@/hooks/useApiKeys'

interface ApiKeyListProps {
  apiKeys: ApiKey[]
  onRegenerate: (id: string) => void
}

export default function ApiKeyList({ apiKeys, onRegenerate }: ApiKeyListProps) {
  const { revoke, delete: deleteKey, isRevoking, isDeleting } = useApiKeyActions()
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleRevoke = (id: string) => {
    if (confirm('Revoke this API key? It will no longer be usable.')) {
      revoke(id)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this API key? This action cannot be undone.')) {
      deleteKey(id)
    }
  }

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800 sticky top-0">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Scopes</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <motion.tr
              key={key.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={key.status === 'revoked' ? 'opacity-50' : ''}
            >
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.slice(0, 3).map((scope) => (
                    <Badge key={scope} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                  {key.scopes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{key.scopes.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {formatDateTime(key.created_at)}
              </TableCell>
              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {key.last_used_at ? formatDateTime(key.last_used_at) : 'Never'}
              </TableCell>
              <TableCell>
                <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                  {key.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {key.key_prefix && (
                      <DropdownMenuItem onClick={() => toggleVisibility(key.id)}>
                        {visibleKeys.has(key.id) ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Key
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show Key
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onRegenerate(key.id)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Regenerate
                    </DropdownMenuItem>
                    {key.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleRevoke(key.id)}>
                        Revoke
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(key.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
