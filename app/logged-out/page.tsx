export const metadata = {
  title: 'Logged Out – GameTrader',
};

export default function LoggedOutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-2xl font-bold mb-2">You've been logged out</h1>
      <p className="text-gray-600 mb-6">Thank you for using GameTrader.</p>


      <img
        src="/gametrader_logo_logout.png"
        alt="GameTrader Logo"
        className="w-48 h-auto"
      />

<p className="text-gray-300 mb-10">#JustSayNoToGameStop</p>

    </main>
  );
}
