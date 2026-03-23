import { Button } from "@/components/ui/button"
export const Navbar =()=>{
    return (
<div className="w-full border-black px-6 py-4 flex flex-col items-center gap-2 max-w-[930px] mx-auto">
          <Button className="h-12 px-6 text-xl font-black uppercase bg-[#06f] text-white border-[5px] border-black shadow-shadow pointer-events-none w-fit">
            ShortRocket 
          </Button>
          <p className="text-base sm:text-xl font-extrabold text-black sm:ml-4 transform rotate-1">
            Make URLs SHORT and SNAPPY! ⚡
          </p>
        </div>
    )
}