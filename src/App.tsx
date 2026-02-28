import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/shell/Layout'
import StatementsPage from './pages/StatementsPage'
import MAWorkbenchPage from './pages/MAWorkbenchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<StatementsPage />} />
          <Route path="/ma" element={<MAWorkbenchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
