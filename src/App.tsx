import './App.css'
import About from './components/About'
import Contact from './components/Contact'
import Header from './components/Header'
import Hero from './components/Hero'
import PageLoader from './components/PageLoader'
import ProjectsAndTech from './components/ProjectsAndTech'
import ScrollProgress from './components/ScrollProgress'
import Starfield from './components/StarField'

function App() {
  return (
    <>
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
          <ProjectsAndTech />
          <Contact />
        </div>
      </div>
    </>
  )
}

export default App
