import Link from 'next/link';

export const metadata = {
  title: 'Logged Out – GameTrader',
};

export default function LoggedOutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="font-roboto text-2xl font-bold mb-2">Logout Successful</h1>
      <p className="font-roboto text-gray-600 mb-6">Thank you for using GameTrader.</p>
      <br></br>
      <img
        src="/gametrader_logo_logout.jpeg"
        alt="GameTrader Logo"
        className="w-48 h-auto"
      />
      <br></br>
      <br></br>
      <Link href="/login">
        <p className="font-roboto font-light text-black-200 mb-6 cursor-pointer hover:underline">Return to Login</p>
      </Link>
    </main>
  );
}
