import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders content', () => {
  const blog = {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 24,
    user: null
  }

  render(<Blog blog={blog} />)

  const title = screen.queryByText(blog.title, { exact: false })
  const author = screen.queryByText(blog.author, { exact: false })
  const url = screen.queryByText(blog.url)

  expect(title).toBeDefined()
  expect(author).toBeDefined()
  expect(url).not.toBeInTheDocument()
})

test('clicking the button shows url and likes', () => {
  const blog = {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 24,
    user: { name: 'jojo' }
  }

  render(<Blog blog={blog} />)

  const button = screen.getByText('view')
  userEvent.click(button)

  const url = screen.getByText(blog.url)
  const likes = screen.getByText(`likes ${blog.likes}`)

  expect(url).toBeDefined()
  expect(likes).toBeDefined()
})

test('clicking the increment like button twice calls event handler twice', async () => {
  const blog = {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 24,
    user: { name: 'jojo' }
  }

  const mockHandler = jest.fn()

  render(
    <Blog blog={blog} incrementLike={mockHandler} />
  )

  const button = screen.getByText('view')
  userEvent.click(button)

  const button2 = screen.getByText('like')
  userEvent.click(button2)
  userEvent.click(button2)

  expect(mockHandler.mock.calls).toHaveLength(2)
})