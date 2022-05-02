import { useSelector } from 'react-redux'

const Notification = () => {
  const notification = useSelector(state => state.notification)

  // if (notification === null) {
  //   return null
  // }

  return notification && (
    <div className="error">
      {notification}
    </div>
  )
}

export default Notification