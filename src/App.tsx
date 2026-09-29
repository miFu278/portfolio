import './App.css'
import About from './components/About'
import Contact from './components/Contact'
import Experience from './components/Experience'
import Header from './components/Header'
import Hero from './components/Hero'
import PageLoader from './components/PageLoader'
import ProjectsAndTech from './components/ProjectsAndTech'
import Research from './components/Research'
import ScrollProgress from './components/ScrollProgress'
import Starfield from './components/StarField'
import { LoadingProvider } from './context/LoadingContext'

function App() {
  return (
    <LoadingProvider>
      <PageLoader />
      <ScrollProgress />
      <div className="relative min-h-screen bg-black text-gray-100">
        {/* Starfield in the background */}
        <div className="fixed inset-0 overflow-hidden">
          <Starfield />
        </div>

        {/* Content above it */}
        <div className="relative z-10">
          <Header />
          <Hero />
          <About />
          <Experience />
          <ProjectsAndTech />
          <Research />
          <Contact />
        </div>
      </div>
    </LoadingProvider>
  )
}

export default App
