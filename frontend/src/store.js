import { configureStore } from '@reduxjs/toolkit'

import blogReducer from './reducers/blogReducer'
import loginReducer from './reducers/loginReducer'
import notificationReducer from './reducers/notificationReducer'
import userReducer from './reducers/userReducer'

const store = configureStore({
  reducer: {
    blogs: blogReducer,
    login: loginReducer,
    notification: notificationReducer,
    users: userReducer
  }
})

export default store