'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Upload, FileText, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { contactsApi } from '@/lib/api/contacts'
import { useContactStore } from '@/store/contactStore'

interface ImportCsvDialogProps {
  open: boolean
  onClose: () => void
}

export default function ImportCsvDialog({ open, onClose }: ImportCsvDialogProps) {
  const { importConfig, setImportConfig } = useContactStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const queryClient = useQueryClient()

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected')
      return contactsApi.import({
        file,
        field_mapping: {
          email: importConfig.email_field,
          first_name: importConfig.first_name_field,
          last_name: importConfig.last_name_field,
        },
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      alert(`Successfully imported ${data.imported} contacts${data.errors > 0 ? ` (${data.errors} errors)` : ''}`)
      handleClose()
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to import contacts')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Read CSV preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').slice(0, 6) // First 5 rows + header
      const csvData = lines.map((line) => line.split(',').map((cell) => cell.trim()))
      
      if (csvData.length > 0) {
        setHeaders(csvData[0])
        setPreview(csvData.slice(1, 6))
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setHeaders([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">CSV File</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-500 mt-1">CSV files only</p>
              </label>
            </div>
          </div>

          {/* Field Mapping */}
          {headers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Map CSV Columns</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">Email *</label>
                    <Select
                      value={importConfig.email_field}
                      onValueChange={(value) => setImportConfig({ email_field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">First Name (optional)</label>
                    <Select
                      value={importConfig.first_name_field || ''}
                      onValueChange={(value) => setImportConfig({ first_name_field: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">Last Name (optional)</label>
                    <Select
                      value={importConfig.last_name_field || ''}
                      onValueChange={(value) => setImportConfig({ last_name_field: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Preview (first 5 rows)</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {headers.map((header, i) => (
                          <th key={i} className="px-3 py-2 text-left text-xs font-medium text-slate-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-slate-600">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => importMutation.mutate()}
            disabled={!file || !importConfig.email_field || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import Contacts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

