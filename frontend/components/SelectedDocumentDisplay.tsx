import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SelectedDocumentDisplayProps {
  documentType: 'sheets' | 'slides';
  documentId: string | null;
  documentName: string | null;
}

const SelectedDocumentDisplay: React.FC<SelectedDocumentDisplayProps> = ({ documentType, documentId, documentName }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Selected {documentType === 'sheets' ? 'Google Sheet' : 'Google Slides'}</CardTitle>
      </CardHeader>
      <CardContent>
        {documentId && documentName ? (
          <p>{documentName} (ID: {documentId})</p>
        ) : (
          <p>No {documentType === 'sheets' ? 'sheet' : 'slides'} selected</p>
        )}
      </CardContent>
    </Card>
  )
}

export default SelectedDocumentDisplay