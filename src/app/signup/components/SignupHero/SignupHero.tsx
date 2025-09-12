import Image from "next/image";

export const SignupHero = () => {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 lg:flex lg:w-1/2">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center text-white">
        <div className="space-y-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-sm font-bold text-blue-600">P</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold">Join Progrs</h1>
              <Image src="/muscle.png" alt="logo" width={50} height={50} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-white bg-white/30" />
              <div className="h-8 w-8 rounded-full border-2 border-white bg-white/30" />
              <div className="h-8 w-8 rounded-full border-2 border-white bg-white/30" />
            </div>
            <span className="text-sm opacity-80">
              100k people already joining us!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
