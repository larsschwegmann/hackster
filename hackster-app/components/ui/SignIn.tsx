import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function SignIn() {

    

    return (
        <div className="text-center">
            <div className="text-left mb-6">
                <h1 className="text-4xl font-bold mb-2">Welcome to Hackster!</h1>
                <p>Sign in with Spotify to get started</p>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => {signIn("spotify")}}><LogIn/> Sign In with Spotify</button>
        </div>
    )
}