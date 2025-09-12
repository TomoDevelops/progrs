export const LoginHero = () => {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 lg:flex lg:w-1/2">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex flex-col items-start justify-center p-12 text-white">
        <div className="mb-8">
          <p className="mb-4 text-sm font-medium opacity-80">A WISE QUOTE</p>
        </div>
        <div className="space-y-6">
          <h1 className="text-5xl leading-tight font-bold">
            Get
            <br />
            Everything
            <br />
            You Want
          </h1>
          <p className="max-w-md text-lg opacity-90">
            You can get everything you want if you work hard,
            <br />
            trust the process, and stick to the plan.
          </p>
        </div>
      </div>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
};
