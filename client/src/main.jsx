import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import AuthBootstrap from './components/AuthBootstrap.jsx'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap>
          <App />
        </AuthBootstrap>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
