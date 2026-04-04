import { X, Calendar, Clock, CreditCard, Car, User, CheckCircle2, Timer, XCircle, Edit3 } from 'lucide-react';
import { Booking } from '../lib/supabase';
import { format } from 'date-fns';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onEdit: (booking: Booking) => void;
}

export default function BookingDetailsModal({ booking, onClose, onUpdateStatus, onEdit }: BookingDetailsModalProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': return { color: 'text-blue-500', icon: <CheckCircle2 className="w-4 h-4" />, bg: 'bg-blue-500/10' };
      case 'active': return { color: 'text-green-500', icon: <CheckCircle2 className="w-4 h-4" />, bg: 'bg-green-500/10' };
      case 'pending': return { color: 'text-yellow-500', icon: <Timer className="w-4 h-4" />, bg: 'bg-yellow-500/10' };
      case 'cancelled': return { color: 'text-red-500', icon: <XCircle className="w-4 h-4" />, bg: 'bg-red-500/10' };
      default: return { color: 'text-gray-500', icon: <Timer className="w-4 h-4" />, bg: 'bg-gray-500/10' };
    }
  };

  const config = getStatusConfig(booking.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-[#1a1c23] border border-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-1">Booking Details</h2>
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} flex items-center gap-1`}>
                    {config.icon}
                    {booking.status}
                </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client & ID Info */}
        <div className="px-6 py-4 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client</span>
            <h3 className="text-2xl font-bold text-white mt-1">{booking.customers?.full_name || 'Generic Client'}</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Booking ID</span>
            <div className="text-sm font-mono text-gray-400 mt-1">#{booking.id.substring(0, 8)}</div>
          </div>
        </div>

        {/* Details Card */}
        <div className="px-6">
          <div className="bg-[#111318] border border-gray-800/50 rounded-xl overflow-hidden">
            {/* Vehicle Info */}
            <div className="p-4 flex items-center justify-between border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-400">Vehicle</span>
              </div>
              <span className="text-sm font-bold text-gray-200">
                {booking.vehicles ? `${booking.vehicles.make} ${booking.vehicles.model}` : 'Not Specified'}
              </span>
            </div>

            {/* Date/Time */}
            <div className="p-4 flex items-center justify-between border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-400">Date/Time</span>
              </div>
              <span className="text-sm font-bold text-orange-500">
                {format(new Date(booking.pickup_datetime), 'EEEE, MMMM do, yyyy @ p')}
              </span>
            </div>

            {/* Price/Payment */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-400">Total Price</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-200">${booking.total_price.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 font-medium">On-Premises</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manage Status Section */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-400">Manage Status</span>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                  booking.status === 'confirmed' 
                    ? 'bg-blue-600/20 border-blue-600 text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-blue-600/50 hover:text-blue-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm
              </button>
              <button 
                onClick={() => onUpdateStatus(booking.id, 'pending')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                  booking.status === 'pending' 
                    ? 'bg-yellow-600/20 border-yellow-600 text-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.2)]' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-yellow-600/50 hover:text-yellow-500'
                }`}
              >
                <Timer className="w-4 h-4" />
                Pending
              </button>
              <button 
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                  booking.status === 'cancelled' 
                    ? 'bg-red-600/20 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-red-600/50 hover:text-red-500'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => onEdit(booking)}
              className="flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-bold rounded-xl transition-all border border-gray-700"
            >
              <Edit3 className="w-4 h-4" />
              Full Edit
            </button>
            <button 
              onClick={onClose}
              className="flex items-center justify-center py-3 bg-[#2a2d37] hover:bg-[#343845] text-white text-sm font-bold rounded-xl transition-all border border-gray-700 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
