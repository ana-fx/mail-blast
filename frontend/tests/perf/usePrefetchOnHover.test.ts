import { renderHook, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { usePrefetchOnHover } from '@/hooks/usePrefetchOnHover'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('usePrefetchOnHover', () => {
  const mockPrefetch = jest.fn()
  const mockRouter = {
    prefetch: mockPrefetch,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should prefetch on hover after delay', () => {
    const { result } = renderHook(() => usePrefetchOnHover('/dashboard'))

    act(() => {
      result.current.onMouseEnter()
    })

    expect(mockPrefetch).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(120)
    })

    expect(mockPrefetch).toHaveBeenCalledWith('/dashboard')
  })

  it('should cancel prefetch on mouse leave', () => {
    const { result } = renderHook(() => usePrefetchOnHover('/dashboard'))

    act(() => {
      result.current.onMouseEnter()
    })

    act(() => {
      result.current.onMouseLeave()
    })

    act(() => {
      jest.advanceTimersByTime(120)
    })

    expect(mockPrefetch).not.toHaveBeenCalled()
  })

  it('should respect custom delay', () => {
    const { result } = renderHook(() =>
      usePrefetchOnHover('/dashboard', { delay: 200 })
    )

    act(() => {
      result.current.onMouseEnter()
    })

    act(() => {
      jest.advanceTimersByTime(120)
    })

    expect(mockPrefetch).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(80)
    })

    expect(mockPrefetch).toHaveBeenCalled()
  })

  it('should not prefetch when disabled', () => {
    const { result } = renderHook(() =>
      usePrefetchOnHover('/dashboard', { enabled: false })
    )

    act(() => {
      result.current.onMouseEnter()
    })

    act(() => {
      jest.advanceTimersByTime(120)
    })

    expect(mockPrefetch).not.toHaveBeenCalled()
  })
})

