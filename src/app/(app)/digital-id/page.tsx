'use client';

import { Download, User, Mail, Phone, Calendar, Smartphone } from 'lucide-react';

export default function DigitalID() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Digital ID</h1>
        <p className="text-gray-400">Your secure identification card for travel</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ID Card */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 border border-purple-700 rounded-2xl p-8 aspect-video flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-300 font-mono tracking-wider">BHARAT ID CARD</div>
                <div className="text-4xl font-bold mt-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">John Doe</div>
              </div>
              <div className="text-4xl">🛡️</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-gray-300">Issued</div>
                <div className="text-sm font-mono">01/15/2024</div>
              </div>
              <div>
                <div className="text-xs text-gray-300 text-right">Valid Until</div>
                <div className="text-sm font-mono">01/15/2027</div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
              QR Code
            </div>
          </div>
          <p className="text-sm text-gray-400 text-center">Scan for quick verification</p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <User size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Full Name</div>
              <div className="font-semibold">John Doe</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Mail size={20} className="text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Email</div>
              <div className="font-semibold text-sm">john@example.com</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Phone size={20} className="text-green-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Phone</div>
              <div className="font-semibold">+1 (555) 123-4567</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Calendar size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Expiration</div>
              <div className="font-semibold">01/15/2027</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
          <Download size={20} />
          Download ID
        </button>
        <button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-gray-600 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
          <Smartphone size={20} />
          Share Digital ID
        </button>
      </div>
    </div>
  );
}
