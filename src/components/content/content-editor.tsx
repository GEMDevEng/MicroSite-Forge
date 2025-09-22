'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  RefreshCw,
  Eye,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Target,
  MessageSquare,
} from 'lucide-react'

// Types
interface ContentItem {
  title: string
  content: string
  metaDescription: string
  seoKeywords: string[]
  path?: string
  validation: {
    score: number
    issues: string[]
    wordCount: number
    passed: boolean
  }
}

interface ContentEditorProps {
  content: ContentItem[]
  onContentUpdate?: (index: number, updatedContent: ContentItem) => void
  onRegenerateContent?: (index: number) => void
  onApproveContent?: (content: ContentItem[]) => void
  keyword?: string
  niche?: string
}

export default function ContentEditor({
  content,
  onContentUpdate,
  onRegenerateContent,
  onApproveContent,
  keyword,
  niche,
}: ContentEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState<ContentItem[]>(content)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    setEditedContent(content)
  }, [content])

  const handleContentChange = (index: number, field: keyof ContentItem, value: any) => {
    const updated = [...editedContent]
    updated[index] = { ...updated[index], [field]: value }
    setEditedContent(updated)
    onContentUpdate?.(index, updated[index])
  }

  const handleRegenerate = (index: number) => {
    onRegenerateContent?.(index)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  const renderMarkdown = (markdown: string) => {
    // Simple markdown rendering for preview
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>')
  }

  const calculateAverageScore = () => {
    const totalScore = editedContent.reduce((sum, item) => sum + item.validation.score, 0)
    return Math.round(totalScore / editedContent.length)
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                {getScoreIcon(calculateAverageScore())}
                <span className={`font-semibold ${getScoreColor(calculateAverageScore())}`}>
                  Avg. Score: {calculateAverageScore()}/100
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={previewMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="mr-1 h-4 w-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              {onApproveContent && (
                <Button
                  onClick={() => onApproveContent(editedContent)}
                  disabled={calculateAverageScore() < 70}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve & Deploy
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {keyword && niche && (
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>
                  Niche: <strong>{niche}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                <span>
                  Keyword: <strong>{keyword}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Pages: {editedContent.length}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content Pages */}
      <div className="space-y-4">
        {editedContent.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(item.validation.score)}
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <Badge variant={item.validation.passed ? 'default' : 'destructive'}>
                    {item.validation.score}/100
                  </Badge>
                  {item.path && (
                    <Badge variant="outline" className="text-xs">
                      {item.path}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    {editingIndex === index ? 'Done' : 'Edit'}
                  </Button>
                  {onRegenerateContent && (
                    <Button variant="outline" size="sm" onClick={() => handleRegenerate(index)}>
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
              {item.validation.issues.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    Issues: {item.validation.issues.join(', ')}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {editingIndex === index ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`title-${index}`}>Title</Label>
                      <Input
                        id={`title-${index}`}
                        value={item.title}
                        onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`keywords-${index}`}>SEO Keywords (comma-separated)</Label>
                      <Input
                        id={`keywords-${index}`}
                        value={item.seoKeywords.join(', ')}
                        onChange={(e) =>
                          handleContentChange(
                            index,
                            'seoKeywords',
                            e.target.value.split(',').map((k) => k.trim())
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`meta-${index}`}>
                      Meta Description ({item.metaDescription.length}/160)
                    </Label>
                    <Textarea
                      id={`meta-${index}`}
                      value={item.metaDescription}
                      onChange={(e) =>
                        handleContentChange(index, 'metaDescription', e.target.value)
                      }
                      rows={2}
                      className={item.metaDescription.length > 160 ? 'border-red-300' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`content-${index}`}>
                      Content (Word count: {item.validation.wordCount})
                    </Label>
                    <Textarea
                      id={`content-${index}`}
                      value={item.content}
                      onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                // Preview Mode
                <div className="space-y-4">
                  {previewMode ? (
                    <div className="rounded border bg-gray-50 p-4">
                      <h1 className="mb-4 text-2xl font-bold">{item.title}</h1>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            `<p class="text-gray-600 mb-4">${item.metaDescription}</p>` +
                            renderMarkdown(item.content),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <h3 className="mb-2 font-semibold">Keywords</h3>
                        <div className="flex flex-wrap gap-1">
                          {item.seoKeywords.map((keyword, kid) => (
                            <Badge key={kid} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold">Meta Description</h3>
                        <p className="rounded border bg-yellow-50 p-2 text-sm text-gray-600">
                          {item.metaDescription}
                        </p>
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold">Content Preview</h3>
                        <div className="max-h-48 overflow-hidden rounded bg-gray-50 p-3 font-mono text-sm text-gray-700">
                          {item.content.slice(0, 500)}...
                        </div>
                      </div>

                      <div className="flex items-center gap-4 border-t pt-2 text-sm text-gray-500">
                        <span>Word count: {item.validation.wordCount}</span>
                        <span
                          className={`flex items-center gap-1 ${getScoreColor(item.validation.score)}`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          SEO Score: {item.validation.score}/100
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Issues: {item.validation.issues.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
