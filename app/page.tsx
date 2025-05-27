import Link from 'next/link';
import Image from "next/image";
// ...existing code...
import Navbar from '../components/Navbar'; // ✅ assuming file is in /components




const BookshelfSVG = () => (
  <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="0" y="0" width="600" height="400" fill="#000" />
    <g>
      <rect x="30" y="320" width="30" height="60" fill="#FFD700"/>
      <rect x="65" y="300" width="20" height="80" fill="#FF6B00"/>
      <rect x="90" y="310" width="25" height="70" fill="#00CFFF"/>
      <rect x="120" y="295" width="18" height="85" fill="#FF4C60"/>
      <rect x="145" y="325" width="22" height="55" fill="#7CFFB2"/>
      <rect x="172" y="305" width="20" height="75" fill="#FFB347"/>
      <rect x="195" y="315" width="18" height="65" fill="#A259FF"/>
      <rect x="215" y="300" width="25" height="80" fill="#43E97B"/>
      <rect x="245" y="320" width="20" height="60" fill="#FF6B00"/>
      <rect x="270" y="310" width="22" height="70" fill="#FFD700"/>
      <rect x="295" y="295" width="18" height="85" fill="#00CFFF"/>
      <rect x="315" y="325" width="25" height="55" fill="#FF4C60"/>
      <rect x="345" y="305" width="20" height="75" fill="#7CFFB2"/>
      <rect x="370" y="315" width="18" height="65" fill="#FFB347"/>
      <rect x="390" y="300" width="25" height="80" fill="#A259FF"/>
      <rect x="420" y="320" width="20" height="60" fill="#43E97B"/>
      <rect x="445" y="310" width="22" height="70" fill="#FF6B00"/>
      <rect x="470" y="295" width="18" height="85" fill="#FFD700"/>
      <rect x="490" y="325" width="25" height="55" fill="#00CFFF"/>
      <rect x="520" y="305" width="20" height="75" fill="#FF4C60"/>
      <rect x="545" y="315" width="18" height="65" fill="#7CFFB2"/>
    </g>
    <path d="M0,350 Q300,250 600,350" stroke="#FF6B00" strokeWidth="10" fill="none"/>
    <path d="M0,370 Q300,270 600,370" stroke="#FFD700" strokeWidth="10" fill="none"/>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#3b258c]">
      {/* Navigation */}
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center py-6 px-8">
        <div className="font-bold text-lg text-white tracking-wide">Database</div>
        <div className="space-x-8">
          <Link href="#" className="text-white hover:text-[var(--secondary)] transition font-medium">About Us</Link>
          <Link href="#" className="text-white hover:text-[var(--secondary)] transition font-medium">Contact</Link>
        </div>
      </nav>
      {/* Main Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden" style={{minHeight: '480px'}}>
        {/* Curved Left Section */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center z-10" style={{clipPath: 'ellipse(90% 100% at 0% 50%)', background: '#fff'}}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3b258c] mb-4 leading-tight">Comprehensive<br/>Library</h1>
          <p className="text-gray-700 mb-8 text-lg">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <Link href="#" className="btn-primary inline-block shadow-lg">LEARN MORE</Link>
        </div>
        {/* Bookshelf SVG Right Section */}
        <div className="hidden md:block w-1/2 h-full bg-transparent absolute right-0 top-0 bottom-0">
          <BookshelfSVG />
        </div>
      </div>
    </div>
  );
}
