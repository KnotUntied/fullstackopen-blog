import { useDispatch } from 'react-redux'
import { createBlog } from '../reducers/blogReducer'

const BlogForm = () => {
  const dispatch = useDispatch()

  const addBlog = async (event) => {
    event.preventDefault()
    const blog = {
      title: event.target.title.value,
      author: event.target.author.value,
      url: event.target.url.value
    }
    event.target.title.value = ''
    event.target.author.value = ''
    event.target.url.value = ''
    dispatch(createBlog(blog))
  }

  return (
    <div>
      <h2>Create a new blog</h2>

      <form onSubmit={addBlog}>
        <div>
          <input
            name='title'
            placeholder='title'
          />
        </div>
        <div>
          <input
            name='author'
            placeholder='author'
          />
        </div>
        <div>
          <input
            name='url'
            placeholder='url'
          />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default BlogForm