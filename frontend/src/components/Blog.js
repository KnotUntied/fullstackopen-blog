import { useSelector, useDispatch } from 'react-redux'

import {
  useNavigate
} from 'react-router-dom'

import { like, removeBlog, createComment } from '../reducers/blogReducer'
import { setNotification } from '../reducers/notificationReducer'

const Blog = ({ blog }) => {
  const user = useSelector(state => state.login)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const incrementLike = () => {
    dispatch(like(blog.id))
  }

  const deleteBlog = () => {
    try {
      dispatch(removeBlog(blog.id))
      navigate('/')
    } catch (exception) {
      dispatch(setNotification('unauthorized', 5))
    }
  }

  const addComment = async (event) => {
    event.preventDefault()
    const comment = {
      text: event.target.text.value
    }
    event.target.text.value = ''
    dispatch(createComment(blog.id, comment))
  }

  if (!blog) {
    return null
  }

  return (
    <>
      <h2>{blog.title} {blog.author}</h2>
      <a href={blog.url}>{blog.url}</a>
      <div>likes {blog.likes}
        <button onClick={incrementLike}>like</button>
      </div>
      <div>{blog.user && `added by ${blog.user.name}`}</div>
      {/* Not ideal but good enough for now */}
      {user && user.name === blog.user.name && <button onClick={deleteBlog}>delete</button>}
      <h3>comments</h3>
      <form onSubmit={addComment}>
        <input
          name='text'
          placeholder='comment'
        />
        <button type="submit">add comment</button>
      </form>
      <ul>
        {blog.comments.map(comment =>
          <li key={comment.id}>{comment.text}</li>
        )}
      </ul>
    </>
  )
}

export default Blog