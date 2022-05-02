import { createSlice } from '@reduxjs/toolkit'

import { replaceUser } from './userReducer'

import blogService from '../services/blogs'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    appendBlog(state, action) {
      state.push(action.payload)
    },
    setBlogs(state, action) {
      return action.payload
    },
    replaceBlog(state, action) {
      const changedBlog = action.payload
      return state.map(blog =>
        blog.id !== changedBlog.id ? blog : changedBlog
      )
    },
    deleteBlog(state, action) {
      const id = action.payload
      return state.filter(blog =>
        blog.id !== id
      )
    }
  },
})

export const initializeBlogs = () => {
  return async dispatch => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlog = blog => {
  return async (dispatch, getState) => {
    const newBlog = await blogService.create(blog)
    dispatch(appendBlog(newBlog))
    const userToChange = getState().users.find(user => user.id === newBlog.user.id)
    const changedUser = {
      ...userToChange,
      blogs: userToChange.blogs.concat(newBlog)
    }
    dispatch(replaceUser(changedUser))
  }
}

export const createComment = (id, comment) => {
  return async (dispatch, getState) => {
    const newComment = await blogService.createComment(id, comment)
    const blogToChange = getState().blogs.find(blog => blog.id === newComment.blog)
    const changedBlog = {
      ...blogToChange,
      comments: blogToChange.comments.concat(newComment)
    }
    dispatch(replaceBlog(changedBlog))
  }
}

export const removeBlog = id => {
  return async dispatch => {
    await blogService.remove(id)
    dispatch(deleteBlog(id))
  }
}

export const like = id => {
  return async (dispatch, getState) => {
    const blogToChange = getState().blogs.find(blog => blog.id === id)
    const changedBlog = {
      ...blogToChange,
      likes: blogToChange.likes + 1,
      user: blogToChange.user.id
    }
    const resultingBlog = await blogService.update(id, changedBlog)
    dispatch(replaceBlog(resultingBlog))
  }
}

export const { appendBlog, setBlogs, replaceBlog, deleteBlog } = blogSlice.actions

export default blogSlice.reducer