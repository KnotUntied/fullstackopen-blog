const notificationReducer = (state = '', action) => {
  switch (action.type) {
  case 'SET_NOTIFICATION':
    return action.notification
  default:
    return state
  }
}

export const notificationChange = notification => {
  return {
    type: 'SET_NOTIFICATION',
    notification,
  }
}

export const notificationRemove = () => {
  return {
    type: 'SET_NOTIFICATION',
    notification: '',
  }
}

export const setNotification = (notification, seconds) => {
  return async dispatch => {
    dispatch(notificationChange(notification))
    setTimeout(() => {
      dispatch(notificationRemove())
    }, seconds * 1000)
  }
}

export default notificationReducer