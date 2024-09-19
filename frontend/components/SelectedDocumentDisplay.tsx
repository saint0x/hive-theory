import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SelectedDocumentDisplayProps {
  documentType: 'sheets' | 'slides'
  documentId: string | null
  documentName: string | null
}

const SelectedDocumentDisplay: React.FC<SelectedDocumentDisplayProps> = ({ documentType, documentId, documentName }) => {
  if (!documentId || !documentName) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{documentType === 'sheets' ? 'Selected Google Sheet' : 'Selected Google Slides'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{documentName}</p>
        <p className="text-sm text-gray-500">ID: {documentId}</p>
      </CardContent>
    </Card>
  )
}

export default SelectedDocumentDisplay