import { Disclaimer } from "./components/common/Disclaimer"
import { Navbar } from "./components/common/Navbar"
import { FeatureCard } from "./components/FeatureCards"
import { UrlShortnerForm } from "./components/UrlShortnerForm"

export const App = () => {
  return (
    <>
      <div className="bg-[#fffbf2]">
        {/* Navbar — normal flow, no fixed/absolute */}
       <Navbar/>
        {/* Main content — no extra padding needed since navbar is in normal flow */}
        <div className="px-6 py-8 flex flex-col items-center gap-8">
          <div className="w-full max-w-[930px] flex flex-col gap-4">
            <UrlShortnerForm/>
            <FeatureCard/>
            <Disclaimer/>
          </div>
        </div>
      </div>
    </>
  )
}