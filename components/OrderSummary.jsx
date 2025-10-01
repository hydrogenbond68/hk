import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const OrderSummary = ({ totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES';
    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleCouponCode = async (event) => {
        event.preventDefault();
        // TODO: implement coupon verification with backend
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!selectedAddress) {
            return toast.error("Please select an address before placing order");
        }

        if (!phoneNumber) {
            return toast.error("Please enter your M-Pesa phone number");
        }

        // Call your backend API to trigger Daraja STK Push
        try {
            await toast.promise(
                fetch("/api/mpesa/stkpush", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: coupon
                            ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2)
                            : totalPrice,
                        phone: phoneNumber,
                        tillNumber: "8379978",
                        items,
                        address: selectedAddress,
                    })
                }),
                {
                    loading: "Processing M-Pesa Payment...",
                    success: "STK Push sent to your phone. Enter your PIN to confirm.",
                    error: "Payment failed. Try again."
                }
            );

            // After payment, redirect
            router.push('/orders');
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>

            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select
                                        className='border border-slate-400 p-2 w-full my-3 outline-none rounded'
                                        onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>
                                                    {address.name}, {address.city}, {address.state}, {address.zip}
                                                </option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1'
                                onClick={() => setShowAddressModal(true)} >
                                Add Address <PlusIcon size={18} />
                            </button>
                        </div>
                    )
                }
            </div>

            {/* Phone number input for M-Pesa */}
            <div className='pb-4 border-b border-slate-200'>
                <label className='text-slate-400 text-xs'>M-Pesa Phone Number</label>
                <input
                    type="text"
                    placeholder='e.g. 2547XXXXXXXX'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className='border border-slate-400 p-1.5 rounded w-full outline-none mt-2'
                />
            </div>

            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>
                    {currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}
                </p>
            </div>

            <button
                onClick={handlePlaceOrder}
                className='w-full bg-green-600 text-white py-2.5 rounded hover:bg-green-800 active:scale-95 transition-all'
            >
                Pay with M-Pesa
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </div>
    )
}

export default OrderSummary;
