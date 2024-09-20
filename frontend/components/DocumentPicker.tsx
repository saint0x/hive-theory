'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, File, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface File {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

interface DocumentPickerProps {
  documentType: 'sheets' | 'slides';
  onSelect: (id: string, name: string) => void;
}

const DocumentPicker: React.FC<DocumentPickerProps> = ({ documentType, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const mimeType = documentType === 'sheets' 
    ? 'application/vnd.google-apps.spreadsheet'
    : 'application/vnd.google-apps.presentation'

  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/drive/list?mimeType=${encodeURIComponent(mimeType)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setIsLoading(false)
    }
  }, [mimeType])

  useEffect(() => {
    if (isOpen) {
      fetchFiles()
    }
  }, [isOpen, fetchFiles])

  const handleSelect = (file: File) => {
    onSelect(file.id, file.name)
    setIsOpen(false)
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Select {documentType === 'sheets' ? 'Spreadsheet' : 'Presentation'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Select a {documentType === 'sheets' ? 'Google Sheet' : 'Google Slides'}</DialogTitle>
            <DialogDescription>
              Choose a file from your Google Drive
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
          </div>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-4 p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => handleSelect(file)}
                >
                  {file.thumbnailLink ? (
                    <Image src={file.thumbnailLink} alt={file.name} width={40} height={40} className="object-cover rounded" />
                  ) : (
                    <File className="w-10 h-10 text-blue-500" />
                  )}
                  <span className="flex-grow">{file.name}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No files found</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DocumentPicker