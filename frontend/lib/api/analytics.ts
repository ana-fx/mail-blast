const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface OverviewStats {
  total_sent: number
  total_delivered: number
  total_bounced: number
  total_complaint: number
  total_failed: number
  open_rate: number
  click_rate: number
}

export interface TimelineStat {
  date: string
  sent: number
  delivered: number
  opens: number
  clicks: number
  bounces: number
  complaints: number
}

export interface TopLink {
  url: string
  click_count: number
  last_clicked: string
}

export interface EmailEvent {
  id: string
  event_type: string
  meta: Record<string, any>
  created_at: string
}

export interface EmailEventsResponse {
  message_id: string
  events: EmailEvent[]
}

export async function getOverview(): Promise<OverviewStats> {
  try {
    const response = await fetch(`${API_URL}/analytics/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching overview:', error)
    throw new Error(`Failed to fetch overview stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getTimeline(range: string = '7d'): Promise<TimelineStat[]> {
  try {
    const response = await fetch(`${API_URL}/analytics/timeline?range=${range}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching timeline:', error)
    throw new Error(`Failed to fetch timeline stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getTopLinks(limit: number = 10): Promise<TopLink[]> {
  try {
    const response = await fetch(`${API_URL}/analytics/top-links?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching top links:', error)
    throw new Error(`Failed to fetch top links: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getEmailEvents(messageId: string): Promise<EmailEventsResponse> {
  try {
    const response = await fetch(`${API_URL}/analytics/events/${encodeURIComponent(messageId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching email events:', error)
    throw new Error(`Failed to fetch email events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

