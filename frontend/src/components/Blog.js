import { useState } from 'react'

const Blog = ({ blog, incrementLike, deleteBlog }) => {
  const [expanded, setExpanded] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} className='blog'>
      {blog.title} {blog.author} <button onClick={() => setExpanded(!expanded)}>{expanded ? 'hide' : 'view'}</button>
      {expanded && <>
        <div>{blog.url}</div>
        <div>likes {blog.likes}
          <button onClick={incrementLike}>like</button>
        </div>
        <div>{blog.user && blog.user.name}</div>
        <button onClick={deleteBlog}>delete</button>
      </>}
    </div>
  )
}

export default Blog