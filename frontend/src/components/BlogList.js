import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { createBlog } from '../reducers/blogReducer'

import BlogForm from './BlogForm'
import Togglable from './Togglable'

const BlogList = ({ blogs }) => {
  const user = useSelector(state => state.login)
  const dispatch = useDispatch()

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const blogFormRef = useRef()

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    dispatch(createBlog(blogObject))
  }

  return (
    <>
      {user &&
        <div>
          <Togglable buttonLabel="create new" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
        </div>
      }
      {blogs.map(blog =>
        <div key={blog.id} style={blogStyle} className='blog'>
          <Link to={`/blogs/${blog.id}`}>{blog.title} {blog.author}</Link>
        </div>
      )}
    </>
  )
}

export default BlogList