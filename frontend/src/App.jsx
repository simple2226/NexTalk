import { Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className='select-none'>
      <Outlet/>
    </div>
  )
}

export default App