import { createSlice } from '@reduxjs/toolkit'

import blogService from '../services/blogs'
import loginService from '../services/login'

const loginSlice = createSlice({
  name: 'login',
  initialState: null,
  reducers: {
    setLogin(state, action) {
      return action.payload
    }
  },
})

export const initializeLogin = () => {
  return async dispatch => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setLogin(user))
      blogService.setToken(user.token)
    }
  }
}

export const loginUser = userObject => {
  return async dispatch => {
    const user = await loginService.login(userObject)
    dispatch(setLogin(user))
    blogService.setToken(user.token)
    window.localStorage.setItem(
      'loggedBlogappUser', JSON.stringify(user)
    )
  }
}

export const logoutUser = () => {
  return async dispatch => {
    dispatch(setLogin(null))
    blogService.setToken(null)
    window.localStorage.removeItem('loggedBlogappUser')
  }
}

export const { setLogin } = loginSlice.actions

export default loginSlice.reducer