
import {InputBox} from "@/components/common/inputbox"
import { Button } from "@/components/ui/button"
import {useState} from "react";
import {useAppDispatch,useAppSelector} from "@/app/hooks";
import {resetUrl} from "@/store/urlSlice";
import { shortenUrlAsync,} from "@/store/urlSlice"
import { QRCodeSVG } from 'qrcode.react'

export const UrlShortnerForm =()=>{

  const [url , setUrl] = useState("")
  const dispatch = useAppDispatch();
  const [showQr,setShowQr] = useState(false);

  const {result, loading, error } = useAppSelector((state) => state.url)

  const handelSubmit = (e: React.FormEvent)=>{
    e.preventDefault()
    if(url.trim()){
      dispatch(shortenUrlAsync(url))
    }
  }

  function copyURL() {
    const shortUrl = result?.shortUrl;
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl).then(() => {
      alert("URL copied to clipboard!");
    });
  }

  const HandleReset = ()=>{
    setUrl("")
    dispatch(resetUrl())
  }

  return (
    <div className="bg-white border-[5px] border-black p-6 shadow-shadow flex flex-col justify-between w-full min-h-[266px]">
      <form onSubmit={handelSubmit} className="flex flex-col gap-6">
        <div>
          <h3 className="block text-lg font-black text-black uppercase tracking-wider">
            PASTE YOUR LOoooooNG URL HERE
          </h3>
        </div>

        <div>
          <InputBox
            placeholder="https://example.com/your-very-long-url-here..."
            className="w-full px-4 py-3 text-lg font-bold border-[7px] border-black focus:outline-none focus:shadow-[8px_8px_0px_#0066FF] transition-shadow bg-white"
            type="url"
            required
            value={url}
            onChange={(e)=>setUrl(e.target.value)}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-19 text-2xl font-black uppercase bg-[#ffbe0b] text-black border-[5px] border-black shadow-none hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-shadow transition-all active:translate-x-0 active:translate-y-0 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Shortening..." : "✨ Shorten It"}
          </Button>
        </div>
      </form>

      {/* Show Error */}
      {error && (
        <div className="mt-4 p-3 border-4 border-red-600 bg-red-100 text-red-600 font-bold">
          {error}
        </div>
      )}

      {/* Show Result */}
      {result && (
        <div className="pt-12">
          <div className="bg-[#fff500] border-[5px] border-black p-6 shadow-neo-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#00ff87] border-[4px] border-black px-3 py-1">
                <span className="text-xl font-black">🎉</span>
              </div>
              <h2 className="text-2xl font-black text-black uppercase">Your Short URL:</h2>
            </div>

            <div className="bg-white border-[5px] border-black p-4 mb-4 shadow-neo-sm">
              <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-[#06f] break-all hover:underline cursor-pointer">
                {result.shortUrl}
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={copyURL}
                className="flex items-center justify-center gap-2 py-3 px-4 text-lg font-black uppercase bg-[#ff006e] text-white border-[5px] border-black shadow-neo-sm hover:shadow-neo-md hover:-translate-y-1 hover:-translate-x-1 transition-all active:shadow-none active:translate-x-0 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
                Copy URL
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="flex items-center justify-center gap-2 py-3 px-4 text-lg font-black uppercase bg-[#06f] text-white border-[5px] border-black shadow-neo-sm hover:shadow-neo-md hover:-translate-y-1 hover:-translate-x-1 transition-all active:shadow-none active:translate-x-0 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="5" height="5" x="3" y="3" rx="1"></rect>
                  <rect width="5" height="5" x="16" y="3" rx="1"></rect>
                  <rect width="5" height="5" x="3" y="16" rx="1"></rect>
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                  <path d="M21 21v.01"></path>
                  <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                  <path d="M3 12h.01"></path>
                  <path d="M12 3h.01"></path>
                  <path d="M12 16v.01"></path>
                  <path d="M16 12h1"></path>
                  <path d="M21 12v.01"></path>
                  <path d="M12 21v-1"></path>
                </svg>
                {showQr ? "Hide QR" : "Show QR"}
              </button>
            </div>

            {/* QR Code Panel */}
            {showQr && (
              <div className="mt-4 bg-white border-[5px] border-black p-6">
                <div className="flex justify-center mb-4">
                  <div className="border-[4px] border-black p-3 inline-block">
                    <QRCodeSVG value={result.shortUrl} size={160} />
                  </div>
                </div>
                <button
                  onClick={() => setShowQr(false)}
                  className="w-full py-2 text-sm font-black uppercase border-[3px] border-black hover:bg-black hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}