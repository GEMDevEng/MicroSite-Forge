// Test for src/lib/logger.ts
import { logger } from '../logger'

describe('Logger', () => {
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterEach(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })

  it('should log info messages', () => {
    logger.info('Test info message', { id: 123 })
    expect(console.log).toHaveBeenCalledWith('[INFO] Test info message', { id: 123 })
  })

  it('should log error messages', () => {
    const error = new Error('Test error')
    logger.error('Test error message', error, { id: 123 })
    expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', error, { id: 123 })
  })

  it('should log warning messages', () => {
    logger.warn('Test warning message', { id: 123 })
    expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message', { id: 123 })
  })
})
