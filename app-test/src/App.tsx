import './App.css'
import { stableId } from 'virtual:stable-id'

function App() {
  return (
    <div className="App">
      <h1>S Logget test {stableId('ok')}</h1>
      <h1>S Logget test {stableId('ok')}</h1>
      <h1>S Logget test {stableId('ok')}</h1>
      <h1>S Logget test {stableId('ok')}</h1>
      <h1>S Logget test {stableId()}</h1>
    </div>
  )
}

export default App
