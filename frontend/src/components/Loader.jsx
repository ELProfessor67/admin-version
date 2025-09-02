import React from 'react'

const Loader = () => {
    return (
        <div className={"apiloader !bg-primary p-32 h-screen flex items-center justify-center"}>
            <img src={"/white-lingo-you-logo.png"} alt="logo" className='absolute left-1/2 -translate-x-1/2 top-16' />

            <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex flex-col items-center justify-center h-[20rem] w-[20rem] rounded-full relative">
                <div className="absolute inset-0 !rounded-full gradient-border animate-spin !border-[14px] !border-t-white !border-b-white !border-l-transparent !border-r-white" />
                    <img src={"/logo-icon.png"} alt="robot" />
                </div>
                <div className="text-white !text-2xl !font-semibold !font-montserrat">LOADING...</div>
            </div>
        </div>
    )
}

export default Loader