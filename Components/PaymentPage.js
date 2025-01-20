"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { useSession } from 'next-auth/react'
import { FaUserCircle } from "react-icons/fa";
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useRouter } from 'next/navigation'
import { notFound } from "next/navigation"

const PaymentPage = ({ username }) => {
    // const { data: session } = useSession()

    const [paymentform, setPaymentform] = useState({name: "", message: "", amount: ""})
    const [currentUser, setcurrentUser] = useState({})
    const [payments, setPayments] = useState([])
    const searchParams = useSearchParams()
    const router = useRouter()

    // useEffect(() => {
    //     getData()
    // }, [])

    useEffect(() => {
        if(searchParams.get("paymentdone") == "true"){
        toast('Thanks for your donation!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
            });
        }
        router.push(`/${username}`)
     
    }, [])
    

    const handleChange = (e) => {
        setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
    }

    // const getData = async () => {
    //     let u = await fetchuser(username)
    //     setcurrentUser(u)
    //     let dbpayments = await fetchpayments(username)
    //     setPayments(dbpayments) 
    // }


    const pay = async (amount) => {
        // Get the order Id 
        let a = await initiate(amount, username, paymentform)
        console.log(a)
        let orderId = a.id
        var options = {
            // "key": currentUser.razorpayid, // Enter the Key ID generated from the Dashboard
            "key": process.env.NEXT_PUBLIC_KEY_ID, // Enter the Key ID generated from the Dashboard
            "amount": amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "InstaFam", //your business name
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
            "order_id": orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "callback_url": `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,
            "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
                "name": "Arpit Maurya", //your customer's name
                "email": "gaurav.kumar@example.com",
                "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }
        }

        var rzp1 = new Razorpay(options);
        rzp1.open();
    }

    
    return (<>
       <div className="min-h-screen bg-gradient-to-r from-purple-500 via-blue-900 to-pink-500 flex flex-col items-center  py-12">
           {/* Banner Section */}
           <div  className="relative mt-3 w-full max-w-full h-64 shadow-md "
         style={{
           backgroundImage: `url('https://picsum.photos/1600/400')`, // Replace with your dynamic image URL
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
       
         <div className="absolute inset-0 bg-black bg-opacity-20"></div>
       
         <div className="absolute bottom-0 left-0 right-0 flex items-center z-10 justify-center transform translate-y-1/3">
           <div className="w-32 h-32 z-10 bg-white rounded-full shadow-lg border-4 border-white">
             <img
               src="https://picsum.photos/200" // Replace with the dynamic profile picture source
               alt="Creator"
               className="w-full h-full object-cover rounded-full"
             />
           </div>
         </div>
       </div>
       
       <div className="relative mt-8 w-full max-w-md mx-auto p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-lg">
         <h1 className="text-xl font-bold text-white text-center">@{username}</h1>
         <p className="text-sm text-gray-300 text-center mt-2">
           Creating amazing content for the community
         </p>
         <div className="text-center mt-4">
           <p className="text-sm text-white">
             <span className="font-semibold text-white">9,719</span> membersㅤ
             <span className="font-semibold text-white"> 82</span> posts ㅤ
             <span className="font-semibold text-white">$15,450</span>
           </p>
         </div>
       </div>
       
       
           {/* Content Section */}
           <div className="w-full max-w-5xl mt-20 flex flex-col md:flex-row gap-8">
             {/* Leaderboard */}
             <div className="flex-1 bg-white rounded-lg shadow-md p-6">
         <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Donations</h2>
         <ol className="list-decimal list-inside text-lg text-gray-700">
           <li className="flex items-center justify-between py-2">
             <div className="flex items-center space-x-2">
               <FaUserCircle className="text-blue-500 text-2xl" />
               <span>Donor 1</span>
             </div>
             <span>$500</span>
           </li>
           <li className="flex items-center justify-between py-2">
             <div className="flex items-center space-x-2">
               <FaUserCircle className="text-blue-500 text-2xl" />
               <span>Donor 2</span>
             </div>
             <span>$350</span>
           </li>
           <li className="flex items-center justify-between py-2">
             <div className="flex items-center space-x-2">
               <FaUserCircle className="text-blue-500 text-2xl" />
               <span>Donor 3</span>
             </div>
             <span>$250</span>
           </li>
           <li className="flex items-center justify-between py-2">
             <div className="flex items-center space-x-2">
               <FaUserCircle className="text-blue-500 text-2xl" />
               <span>Donor 4</span>
             </div>
             <span>$150</span>
           </li>
           <li className="flex items-center justify-between py-2">
             <div className="flex items-center space-x-2">
               <FaUserCircle className="text-blue-500 text-2xl" />
               <span>Donor 5</span>
             </div>
             <span>$100</span>
           </li>
         </ol>
       </div>
       
             {/* Form Section */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
         <h2 className="text-2xl font-bold text-gray-800 mb-4">Donate</h2>
         <form className="space-y-4">
           {/* Name Input */}
           <div>
             <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
               Name
             </label>
             <input
               type="text"
               onChange={handleChange}
               value = {paymentform.name}
               id="name"
               name = "name"
               placeholder="Enter your name"
               className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
       
           {/* Message Input */}
           <div>
             <label htmlFor="message" className="block text-gray-700 font-medium mb-1">
               Message
             </label>
             <textarea
               id="message"
               onChange={handleChange}
               value = {paymentform.message}
               placeholder="Write a message"
               name = "message"
               rows="4"
               className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
             ></textarea>
           </div>
       
           {/* Amount Input */}
           <div>
             <label htmlFor="amount" className="block text-gray-700 font-medium mb-1">
               Amount
             </label>
             <input
               type="number"
               onChange={handleChange}
               name = "amount"
               value = {paymentform.amount}
               id="amount"
               placeholder="Enter amount"
               className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
       
           {/* Pay Button */}
           <div>
             <button
               type="submit"
               className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
             >
               Pay
             </button>
           </div>
         </form>
       
         {/* Quick Amount Buttons */}
         <div className="mt-4 flex justify-center space-x-4">
           <button
             onClick={() => pay(10000)}
             className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
           >
             $10
           </button>
           <button
             onClick={() => pay(20000)}
             className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
           >
             $20
           </button>
           <button
             onClick={() => pay(30000)}
             className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
           >
             $30
           </button>
         </div>
       </div>
       
           </div>
         </div>
         </>)
}

export default PaymentPage