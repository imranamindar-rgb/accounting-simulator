import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavDrawer from './components/shell/NavDrawer'
import ChapterLayout from './components/shell/ChapterLayout'

const Home = lazy(() => import('./pages/Home'))
const ChapterPage = lazy(() => import('./pages/ChapterPage'))
const Progress = lazy(() => import('./pages/Progress'))
const StatementsPage = lazy(() => import('./pages/StatementsPage'))
const MAWorkbenchPage = lazy(() => import('./pages/MAWorkbenchPage'))
const AppendixPage = lazy(() => import('./pages/AppendixPage'))

function Loading() {
  return <div className="p-8" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading…</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'var(--color-base)' }}>
        <NavDrawer />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/progress" element={<Progress />} />

            <Route path="/chapter/:id" element={<ChapterLayout />}>
              <Route index element={<Navigate to="zone/1" replace />} />
              <Route path="zone/:zone" element={<ChapterPage />} />
            </Route>

            {/* Legacy simulator routes */}
            <Route path="/simulator" element={<StatementsPage />} />
            <Route path="/ma" element={<MAWorkbenchPage />} />

            <Route path="/appendix/:id" element={<AppendixPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

function Footer() {
  return (
    <footer style={{
      textAlign: 'center', padding: '1.25rem 1rem',
      borderTop: '1px solid var(--color-border)',
      fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
      color: 'var(--color-text-muted)', marginTop: '3rem',
      letterSpacing: '0.04em',
    }}>
      Designed by Imran Dar · Financial Accounting EMBA Platform
    </footer>
  )
}
