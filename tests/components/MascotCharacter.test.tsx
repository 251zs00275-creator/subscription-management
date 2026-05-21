import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MascotCharacter } from '@/components/Common/MascotCharacter'

describe('MascotCharacter', () => {
  it('renders state label and selected mascot', () => {
    render(<MascotCharacter state="alert" characterId="advisor-danger" />)

    expect(screen.getByRole('button', { name: 'レイナをクリック' })).toBeInTheDocument()
    expect(screen.getByText('要確認')).toBeInTheDocument()
  })

  it('shows dialogue when clicked', async () => {
    const user = userEvent.setup()
    render(<MascotCharacter state="neutral" characterId="main-heroine" />)

    await user.click(screen.getByRole('button', { name: 'ミオをクリック' }))

    expect(screen.getByText('支出を一緒に見ています')).toBeInTheDocument()
  })
})
