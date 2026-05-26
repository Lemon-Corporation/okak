'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function ContextCaptureDialog() {
  const contextCapture = useAppStore((state) => state.contextCapture)
  const closeContextCapture = useAppStore((state) => state.closeContextCapture)
  const projects = useAppStore((state) => state.projects)
  const getFileById = useAppStore((state) => state.getFileById)
  const createNote = useAppStore((state) => state.createNote)
  const attachFileToProject = useAppStore((state) => state.attachFileToProject)

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fileName = contextCapture?.type === 'file'
    ? getFileById(contextCapture.fileId)?.name
    : null

  useEffect(() => {
    if (contextCapture) {
      setSelectedProjectId('')
      setError('')
      setIsSaving(false)
    }
  }, [contextCapture])

  const handleClose = () => {
    if (isSaving) return
    closeContextCapture()
  }

  const handleConfirm = async () => {
    if (!contextCapture) return
    if (!selectedProjectId) {
      setError('Выберите проект')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      if (contextCapture.type === 'file') {
        await attachFileToProject(contextCapture.fileId, selectedProjectId)
      } else {
        await createNote({
          title: 'Выделенный текст',
          content: contextCapture.text,
          projectId: selectedProjectId,
          tags: [],
          isPinned: false,
        })
      }
      closeContextCapture()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить в контекст')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={!!contextCapture} onOpenChange={(open) => {
      if (!open) handleClose()
    }}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="text-base font-semibold">Добавить в контекст проекта</DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {contextCapture?.type === 'file' ? (
              <span>Файл: <span className="text-foreground font-medium">{fileName ?? 'Неизвестный файл'}</span></span>
            ) : (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Текст</div>
                <div className="line-clamp-5 text-foreground">{contextCapture?.text}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Проект</label>
            <Select value={selectedProjectId} onValueChange={(value) => {
              setSelectedProjectId(value)
              setError('')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <div className="text-xs text-destructive">{error}</div>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>Отмена</Button>
            <Button onClick={handleConfirm} disabled={isSaving}>Добавить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
