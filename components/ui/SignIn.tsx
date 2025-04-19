import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function SignIn() {

    

    return (
        <div className="text-center">
            <div className="text-left mb-6">
                <h1 className="text-4xl font-bold mb-2">Welcome to Hackster!</h1>
                <p>Hackster is an open-source reimplementation of the companion app of the Hitster board-game.</p>
                <p>It allows you to make playing cards from your own Spotify playlists and use your Spotify Connect devices as speakers.</p>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => {signIn("spotify")}}><LogIn/> Sign In with Spotify</button>
        </div>
    )
}