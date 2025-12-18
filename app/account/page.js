import Account from '@/components/Account'
import Footer from '@/components/Footer'
import { getServerSession } from "next-auth"
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route"
import { fetchuser } from '@/actions/useractions'
import { redirect } from "next/navigation"

const AccountPage = async () => {
    const session = await getServerSession(nextAuthConfig);

    if (!session) {
        redirect('/');
    }

    const start = Date.now();
    const user = await fetchuser(session.user.email);
    console.log(`Account fetch time: ${Date.now() - start}ms`);

    return (
        <>
            <Account initialUser={user} />
            <Footer forceShow={true} />
        </>
    )
}

export default AccountPage

export const metadata = {
    title: "Your Account",
}