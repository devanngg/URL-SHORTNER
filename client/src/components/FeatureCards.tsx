
export const FeatureCard =()=>{
    return (
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-[838px]">
              <div className="bg-[#ffe6f0] border-[5px] border-black p-6 shadow-shadow transform rotate-2 w-full sm:w-[380px]">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="text-xl font-black text-black mb-1 uppercase">FAST</h3>
                <p className="text-base font-bold">Lightning quick URL shortening!</p>
              </div>

              <div className="bg-[#e6f0ff] border-[5px] border-black p-6 shadow-shadow transform -rotate-2 w-full sm:w-[360px]">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="text-xl font-black text-black mb-1 uppercase">SECURE</h3>
                <p className="text-base font-bold">Your links are safe with us!</p>
              </div>

              <div className="bg-[#fff500] border-[5px] border-black p-6 shadow-shadow transform rotate-1 w-full sm:w-[500px]">
                <div className="text-4xl mb-2">🎨</div>
                <h3 className="text-xl font-black text-black mb-1 uppercase">BOLD</h3>
                <p className="text-base font-bold">Stand out with style!</p>
              </div>
            </div>

    )
}