'use client'

import { Block } from '@/store/builderStore'
import SectionBlock from './blocks/SectionBlock'
import HeadingBlock from './blocks/HeadingBlock'
import ParagraphBlock from './blocks/ParagraphBlock'
import ButtonBlock from './blocks/ButtonBlock'
import ImageBlock from './blocks/ImageBlock'
import SpacerBlock from './blocks/SpacerBlock'

interface BlockRendererProps {
  block: Block
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  const renderBlock = (b: Block) => {
    switch (b.type) {
      case 'section':
        return (
          <SectionBlock key={b.id} block={b}>
            {b.children?.map((child) => (
              <div key={child.id} className="mb-2">{renderBlock(child)}</div>
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

  return renderBlock(block)
}

