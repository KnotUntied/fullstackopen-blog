import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
      setUser(user)
      blogService.setToken(user.token)
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // const handleLogout = async (event) => {
  //   event.preventDefault()
  //   setUser(null)
  //   blogService.setToken(null)
  //   window.localStorage.setItem(
  //     'loggedBlogappUser', JSON.stringify(user)
  //   )
  //   setUsername('')
  //   setPassword('')
  // }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
      })
  }

  const incrementLike = (blogObject) => {
    return () => blogService
      .update(blogObject.id, { ...blogObject, likes: blogObject.likes + 1, user: blogObject.user._id })
      .then(returnedBlog => {
        console.log(returnedBlog)
        setBlogs(blogs.map(blog => blog.id === returnedBlog.id ? returnedBlog : blog))
      })
  }

  const deleteBlog = (blogObject) => {
    return () => window.confirm(`Remove blog ${blogObject.title} by ${blogObject.author}?`) && blogService
      .remove(blogObject.id)
      .then(() => {
        setBlogs(blogs.filter(blog => blog.id !== blogObject.id))
      })
      .catch(() => {
        setErrorMessage('unauthorized')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const blogFormRef = useRef()

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={errorMessage} />

      {user === null ?
        <Togglable buttonLabel='login'>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
        </Togglable> :
        <div>
          <p>{user.name} logged in</p>
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
        </div>
      }

      {sortedBlogs.map(
        blog => <Blog key={blog.id} blog={blog} incrementLike={incrementLike(blog)} deleteBlog={deleteBlog(blog)} />
      )}
    </div>
  )
}

export default App
