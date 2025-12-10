'use client'

import DOMPurify from 'isomorphic-dompurify'

// Sanitize HTML content for safe rendering
// More permissive for email HTML templates
export function sanitizeHTML(html: string): string {
  // Check if it's a full HTML document (has html, head, body tags)
  const isFullHTML = /<html|<head|<body/i.test(html)
  
  if (isFullHTML) {
    // More permissive for full HTML email templates (preview mode)
    // For email preview, we're more permissive since it's not user-facing production content
    let sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'html', 'head', 'body', 'meta', 'title', 'style', 'link',
        'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
        'div', 'span', 'section', 'article', 'header', 'footer', 'main',
        'hr', 'sub', 'sup', 'small', 'strike', 'del', 'ins',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'style', 'id',
        'width', 'height', 'align', 'valign', 'target', 'rel',
        'cellpadding', 'cellspacing', 'border', 'bgcolor', 'background',
        'colspan', 'rowspan', 'scope', 'charset', 'content', 'name',
        'http-equiv', 'viewport', 'loading', 'decoding', 'crossorigin',
        'referrerpolicy', 'type', 'media', 'property', 'itemprop',
      ],
      // Very permissive URI regex for email images - allow any http/https/data URL
      // This regex allows URLs that start with protocol or are absolute paths
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
      ADD_ATTR: ['loading', 'decoding', 'referrerpolicy', 'crossorigin'], 
      FORBID_TAGS: [], 
      FORBID_ATTR: [], 
      ALLOW_DATA_ATTR: true,
      ALLOW_ARIA_ATTR: true,
      SAFE_FOR_TEMPLATES: true,
      SAFE_FOR_XML: false,
      // Allow unknown protocols for email clients
      ALLOW_UNKNOWN_PROTOCOLS: true,
    })
    
    // Post-process to ensure images work correctly
    // 1. Fix incomplete image URLs and add referrerpolicy
    sanitized = sanitized.replace(
      /<img([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
      (match, before, src, after) => {
        let fixedSrc = src.trim()
        
        // Validate and fix incomplete URLs
        // Check if URL is missing protocol/domain
        const hasProtocol = /^(https?|data|mailto|tel):/i.test(fixedSrc)
        const isAbsolutePath = fixedSrc.startsWith('/')
        const isAnchor = fixedSrc.startsWith('#')
        
        // If URL doesn't have protocol and is not absolute/anchor, it's likely incomplete
        if (!hasProtocol && !isAbsolutePath && !isAnchor && fixedSrc.length > 0) {
          // Check if it looks like a URL fragment (e.g., "f1f5f9?text=Footer" from placeholder.com)
          if (fixedSrc.includes('?') || fixedSrc.includes('text=') || fixedSrc.match(/^[a-f0-9]{6}/i)) {
            // This is likely a broken URL - hide the image to prevent ERR_NAME_NOT_RESOLVED
            return `<img${before}src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E" alt="Invalid image URL" data-invalid-url="true" data-original-src="${fixedSrc.replace(/"/g, '&quot;')}"${after}>`
          }
          
          // If it's a relative path without leading slash, it's also invalid for email
          if (!fixedSrc.startsWith('http') && !fixedSrc.startsWith('data') && !fixedSrc.startsWith('/')) {
            return `<img${before}src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E" alt="Invalid image URL" data-invalid-url="true" data-original-src="${fixedSrc.replace(/"/g, '&quot;')}"${after}>`
          }
        }
        
        // Add referrerpolicy if not present
        let newMatch = match
        if (!newMatch.includes('referrerpolicy')) {
          newMatch = newMatch.replace(/(<img[^>]*?)(>)/i, '$1 referrerpolicy="no-referrer-when-downgrade"$2')
        }
        
        // DON'T add crossorigin by default - let browser handle it
        // Some image servers don't support CORS, so adding crossorigin="anonymous" 
        // will cause them to fail. Browser can load images without CORS for simple GET requests.
        // Only add crossorigin if explicitly needed (which we'll handle in the component)
        
        // Add tracking attribute
        if (!newMatch.includes('data-email-image')) {
          newMatch = newMatch.replace(/(<img[^>]*?)(>)/i, '$1 data-email-image="true"$2')
        }
        
        return newMatch
      }
    )
    
    // 3. Add meta tag for referrer policy in head if not present
    if (!sanitized.includes('<meta') || !sanitized.match(/<meta[^>]*referrer/i)) {
      sanitized = sanitized.replace(
        /(<head[^>]*>)/i,
        '$1<meta name="referrer" content="no-referrer-when-downgrade">'
      )
    }
    
    return sanitized
  }
  
  // Standard sanitization for partial HTML
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
      'div', 'span', 'section', 'hr', 'sub', 'sup', 'small', 'strike', 'del', 'ins',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'id',
      'width', 'height', 'align', 'valign', 'target', 'rel',
      'cellpadding', 'cellspacing', 'border', 'bgcolor', 'background',
      'colspan', 'rowspan', 'loading', 'decoding', 'crossorigin',
    ],
    // More permissive URI regex for email images
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|#)/i,
    KEEP_CONTENT: true,
    ADD_ATTR: ['loading', 'decoding'], // Allow loading and decoding attributes
  })
}

// Sanitize user input text
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate URL to prevent open redirects
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    // Reject protocol-relative URLs
    if (url.startsWith('//')) {
      return false
    }
    return true
  } catch {
    return false
  }
}


