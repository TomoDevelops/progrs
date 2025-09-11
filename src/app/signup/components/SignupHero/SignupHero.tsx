export const SignupHero = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
        <div className="space-y-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">P</span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              Join Progrs family!
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Whoa, you wanna learn a new language like a native?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white" />
              <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white" />
              <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white" />
            </div>
            <span className="text-sm opacity-80">100k people already joining us!</span>
          </div>
        </div>
      </div>
    </div>
  );
};