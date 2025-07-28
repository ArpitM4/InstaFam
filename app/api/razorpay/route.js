import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Razorpay from "razorpay";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const POST = async (req) => {
    await connectDb()
    let body = await req.formData()
    body = Object.fromEntries(body)

    // Check if razorpayOrderId is present on the server
    let p = await Payment.findOne({oid: body.razorpay_order_id})
    if(!p){
        return NextResponse.json({success: false, message:"Order Id not found"})
    }

    // fetch the secret of the user who is getting the payment 
    let user = await User.findById(p.to_user)
    // const secret = user.razorpaysecret
    const secret = process.env.KEY_SECRET

    // Verify the payment
    let xx = validatePaymentVerification({"order_id": body.razorpay_order_id, "payment_id": body.razorpay_payment_id}, body.razorpay_signature, secret)

    if(xx){
        // Update the payment status
        const updatedPayment = await Payment.findOneAndUpdate({oid: body.razorpay_order_id}, {done: "true"}, {new: true})
        // If you want to redirect to username, fetch it
        let redirectUsername = user?.username || updatedPayment.to_user;
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/${redirectUsername}?paymentdone=true`)
    }

    else{
        return NextResponse.json({success: false, message:"Payment Verification Failed"})
    }

}