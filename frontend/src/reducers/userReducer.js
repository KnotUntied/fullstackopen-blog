import { createSlice } from '@reduxjs/toolkit'

import userService from '../services/users'

const userSlice = createSlice({
  name: 'users',
  initialState: [],
  reducers: {
    setUsers(state, action) {
      return action.payload
    },
    replaceUser(state, action) {
      const changedUser = action.payload
      return state.map(user =>
        user.id !== changedUser.id ? user : changedUser
      )
    }
  },
})

export const initializeUsers = () => {
  return async dispatch => {
    const users = await userService.getAll()
    dispatch(setUsers(users))
  }
}

export const { setUsers, replaceUser } = userSlice.actions

export default userSlice.reducer