import { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  Link,
  useMatch
} from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { initializeBlogs } from './reducers/blogReducer'
import { initializeLogin, loginUser, logoutUser } from './reducers/loginReducer'
import { setNotification } from './reducers/notificationReducer'
import { initializeUsers } from './reducers/userReducer'

import Blog from './components/Blog'
import BlogList from './components/BlogList'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import User from './components/User'
import UserList from './components/UserList'

const Menu = () => {
  const user = useSelector(state => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()

  const style = {
    background: 'silver',
    padding: 5
  }

  const linkStyle = {
    paddingRight: 5
  }

  const handleLogin = event => {
    event.preventDefault()
    try {
      dispatch(loginUser({ username, password }))
      setUsername('')
      setPassword('')
    } catch (exception) {
      dispatch(setNotification('wrong credentials', 5))
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <div style={style}>
      <Link style={linkStyle} to="/">blogs</Link>
      <Link style={linkStyle} to="/users">users</Link>
      {user === null ?
        <span>
          <Togglable buttonLabel='login'>
            <LoginForm
              username={username}
              password={password}
              handleUsernameChange={({ target }) => setUsername(target.value)}
              handlePasswordChange={({ target }) => setPassword(target.value)}
              handleSubmit={handleLogin}
            />
          </Togglable>
        </span> :
        <>
          {user.name} logged in
          <button onClick={handleLogout}>logout</button>
        </>
      }
    </div>
  )
}

const App = () => {
  const blogs = useSelector(state => state.blogs)
  const users = useSelector(state => state.users)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeBlogs())
    dispatch(initializeLogin())
    dispatch(initializeUsers())
  }, [dispatch])

  const matchBlog = useMatch('/blogs/:id')

  const matchedBlog = matchBlog
    ? blogs.find(blog => blog.id === matchBlog.params.id)
    : null

  const matchUser = useMatch('/users/:id')

  const matchedUser = matchUser
    ? users.find(user => user.id === matchUser.params.id)
    : null

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Menu />
      <h2>blogs</h2>
      <Notification />
      <Routes>
        <Route path="/" element={<BlogList blogs={sortedBlogs} />} />
        <Route path="/blogs/:id" element={<Blog blog={matchedBlog} />} />
        <Route path="/users" element={<UserList users={users} />} />
        <Route path="/users/:id" element={<User user={matchedUser} />} />
      </Routes>
    </div>
  )
}

export default App
