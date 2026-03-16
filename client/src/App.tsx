import { Button } from "@/components/ui/button"
import {InputBox} from "@/components/common/inputbox"
export const App = () => {
  return (
    <div className="bg-[#fffbf2] text-black h-screen flex flex-col items-center justify-center gap-8 p-4">

      {/* Container for Logo and Main Box to ensure they align on the left */}
      <div className="w-full max-w-[930px] flex flex-col gap-4">
        <div className="flex justify-start">
          <div className="text-white p-10">

        
          <Button className=" h-12 px-6 text-xl font-black uppercase bg-[#06f] text-black border-[5px] border-black shadow-shadow pointer-events-none">
            ShortRocket 
          </Button>
          </div>
        </div>

        <div className="bg-white border-[5px] border-black p-6 shadow-shadow flex flex-col justify-between w-full min-h-[266px]">
          <div>
          <h3 className="block text-lg font-black text-black uppercase tracking-wider">
            PASTE YOUR LOoooooNG URL HERE
          </h3>
          </div>
          <div>
          <InputBox 
            placeholder="https://example.com/your-very-long-url-here..." 
            className="w-full px-4 py-3 text-lg font-bold border-[7px] border-black focus:outline-none focus:shadow-[8px_8px_0px_#0066FF] transition-shadow bg-white" 
            type="text" 
          />
          </div>
          <div className="pt-2">

          <Button className="w-full h-19 text-2xl font-black uppercase bg-[#ffbe0b] text-black border-[5px] border-black shadow-none hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-shadow transition-all active:translate-x-0 active:translate-y-0 cursor-pointer">
            ✨ Shorten It
          </Button>
             </div>

        </div>
      

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-[838px]">
        <div className="bg-[#ffe6f0] border-[5px] border-black p-6 shadow-shadow transform rotate-2 w-full sm:w-[260px]">
          <div className="text-4xl mb-2">⚡</div>
          <h3 className="text-xl font-black text-black mb-1 uppercase">FAST</h3>
          <p className="text-base font-bold">Lightning quick URL shortening!</p>
        </div>

        <div className="bg-[#e6f0ff] border-[5px] border-black p-6 shadow-shadow transform -rotate-2 w-full sm:w-[260px]">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-xl font-black text-black mb-1 uppercase">SECURE</h3>
          <p className="text-base font-bold">Your links are safe with us!</p>
        </div>

        <div className="bg-[#fff0e6] border-[5px] border-black p-6 shadow-shadow transform rotate-1 w-full sm:w-[260px]">
          <div className="text-4xl mb-2">🎨</div>
          <h3 className="text-xl font-black text-black mb-1 uppercase">BOLD</h3>
          <p className="text-base font-bold">Stand out with style!</p>
        </div>
      </div>
      <div className="pt-10">
        <div className="bg-[#ffe6f0] border-[5px] border-[#ff006e] p-4 shadow-[#ff006e] mb-6"><div className="flex items-start gap-3"><div className="text-3xl flex-shrink-0">⚠️</div><div><h4 className="text-lg font-black text-[#ff006e] uppercase mb-1">Important Disclaimer</h4><p className="font-bold text-black text-sm">TINEY IS CURRENTLY FREE FOR LIMITED &amp; RESTRICTED USAGE.</p></div></div></div>
      </div>
    </div>
    </div>
  )
}
