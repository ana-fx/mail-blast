'use client'

import { Block } from '@/store/builderStore'
import SectionBlock from './blocks/SectionBlock'
import HeadingBlock from './blocks/HeadingBlock'
import ParagraphBlock from './blocks/ParagraphBlock'
import ButtonBlock from './blocks/ButtonBlock'
import ImageBlock from './blocks/ImageBlock'
import SpacerBlock from './blocks/SpacerBlock'
import SortableBlockWrapper from './SortableBlockWrapper'

interface BlockRendererProps {
  block: Block
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  const renderBlockContent = (b: Block) => {
    switch (b.type) {
      case 'section':
        return (
          <SectionBlock key={b.id} block={b}>
            {b.children?.map((child) => (
              <BlockRenderer key={child.id} block={child} />
            ))}
          </SectionBlock>
        )
      case 'heading':
        return <HeadingBlock key={b.id} block={b} />
      case 'paragraph':
        return <ParagraphBlock key={b.id} block={b} />
      case 'button':
        return <ButtonBlock key={b.id} block={b} />
      case 'image':
        return <ImageBlock key={b.id} block={b} />
      case 'spacer':
        return <SpacerBlock key={b.id} block={b} />
      default:
        return null
    }
  }

  // If it's a section, we don't wrap it in sortable FOR NOW for nested children logic simplicity in this step,
  // or we do if we want sections to be sortable. Assuming sections are top level sortable.
  // Children of sections need to be sortable too?
  // For this MVU, we treat all top-level blocks as Sortable.

  return (
    <SortableBlockWrapper id={block.id}>
      {renderBlockContent(block)}
    </SortableBlockWrapper>
  )
}


