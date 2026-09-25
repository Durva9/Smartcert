import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import IssuerPage from './pages/IssuerPage'
import StudentPage from './pages/StudentPage'
import VerifierPage from './pages/VerifierPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/issuer" element={<IssuerPage />} />
      <Route path="/student" element={<StudentPage />} />
      <Route path="/verifier" element={<VerifierPage />} />
    </Routes>
  )
}

export default App