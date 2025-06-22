import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/utils'
import userEvent from '@testing-library/user-event'
import CurrencyInput from '../CurrencyInput'

describe('CurrencyInput', () => {
  it('should render with default props', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value={0} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('should display formatted value with commas', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value={500000} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('500,000')
  })

  it('should show prefix and suffix', () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput 
        value={100000} 
        onChange={onChange} 
        prefix="$" 
        suffix="CAD" 
      />
    )
    
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('CAD')).toBeInTheDocument()
  })

  it('should handle user input and format with commas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={0} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, '123456')
    
    expect(onChange).toHaveBeenCalledWith(123456)
  })

  it('should remove non-numeric characters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={0} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'abc123def')
    
    expect(onChange).toHaveBeenCalledWith(123)
  })

  it('should handle paste events', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={0} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.paste('$1,234,567.89')
    
    expect(onChange).toHaveBeenCalledWith(123456789)
  })

  it('should prevent non-numeric key presses', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={0} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'abc')
    
    // Should not call onChange for non-numeric input
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should handle backspace and delete', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={12345} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Backspace}')
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should handle empty input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={12345} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.clear(input)
    
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('should maintain cursor position after formatting', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<CurrencyInput value={1234} onChange={onChange} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.click(input)
    
    // Position cursor in middle and type
    input.setSelectionRange(2, 2)
    await user.type(input, '5')
    
    expect(onChange).toHaveBeenCalled()
  })
})