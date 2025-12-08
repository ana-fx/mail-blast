import { Block } from '@/store/builderStore'

export function exportToHTML(blocks: Block[]): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
`

  blocks.forEach((block) => {
    html += renderBlock(block)
  })

  html += `
  </div>
  {{OPEN_PIXEL}}
</body>
</html>
`

  return html
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'section':
      return `
    <div style="padding: ${block.props.padding || '32px'}; background-color: ${block.props.background || '#ffffff'}; text-align: ${block.props.align || 'center'};">
      ${block.children?.map(renderBlock).join('') || ''}
    </div>
  `
    case 'heading':
      const sizeMap: Record<string, string> = {
        sm: '18px',
        md: '24px',
        lg: '30px',
        xl: '36px',
      }
      return `
    <h2 style="font-size: ${sizeMap[block.props.size] || '24px'}; font-weight: bold; color: ${block.props.color || '#1e293b'}; text-align: ${block.props.align || 'left'}; margin: 0 0 16px 0;">
      ${escapeHtml(block.props.text || '')}
    </h2>
  `
    case 'paragraph':
      return `
    <p style="color: ${block.props.color || '#64748b'}; text-align: ${block.props.align || 'left'}; margin: 0 0 16px 0;">
      ${escapeHtml(block.props.text || '').replace(/\n/g, '<br>')}
    </p>
  `
    case 'button':
      const url = block.props.url || '#'
      const bgColor = block.props.bgColor || '#2563eb'
      const isOutline = block.props.style === 'outline'
      return `
    <div style="text-align: ${block.props.align || 'center'}; margin: 16px 0;">
      <a href="{{TRACK_URL:${url}}}" style="display: inline-block; padding: 12px 24px; background-color: ${isOutline ? 'transparent' : bgColor}; color: ${isOutline ? bgColor : '#ffffff'}; border: ${isOutline ? `2px solid ${bgColor}` : 'none'}; border-radius: 8px; font-weight: 500; text-decoration: none;">
        ${escapeHtml(block.props.text || 'Button')}
      </a>
    </div>
  `
    case 'image':
      if (!block.props.src) return ''
      return `
    <div style="text-align: ${block.props.align || 'center'}; margin: 16px 0;">
      <img src="${escapeHtml(block.props.src)}" alt="${escapeHtml(block.props.alt || '')}" style="max-width: 100%; height: auto; width: ${block.props.width || '100%'};" />
    </div>
  `
    case 'spacer':
      return `
    <div style="height: ${block.props.height || 32}px;"></div>
  `
    default:
      return ''
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

