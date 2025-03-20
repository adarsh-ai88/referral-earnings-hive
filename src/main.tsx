
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-gradient-to-br from-background dark:from-background dark:via-mlm-primary/5 dark:to-mlm-accent/5">
        <App />
      </div>
    </ThemeProvider>
  </React.StrictMode>,
)
