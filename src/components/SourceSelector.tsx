import { Source } from '@/types'
import { Button } from "@/components/ui/button"

interface SourceSelectorProps {
  sources: Source[]
  selectedSource: Source | null
  onSelect: (source: Source) => void
}

export default function SourceSelector({ sources, selectedSource, onSelect }: SourceSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source, index) => (
        <Button
          key={index}
          onClick={() => onSelect(source)}
          variant={selectedSource?.source === source.source ? "default" : "outline"}
          size="sm"
          className="text-sm"
        >
          {source.source}
        </Button>
      ))}
    </div>
  )
}

