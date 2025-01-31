"use client";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import Link from "next/link";


export default function StatusBar() {
    const session = useSession();

    if (!session || session.status !== "authenticated") {
        return null;
    } else {
        return (
            <div className="absolute top-2 w-full px-5 pt-5 h-8 flex items-center">
                <span className="flex-grow">Logged in as {session.data.user?.name}</span>
                <div className="flex float-end gap-2">
                    <Link className="btn btn-sm btn-info btn-outline" href="/card-gen">Card Generator</Link>
                    <button className="btn btn-sm btn-accent btn-outline" onClick={() => signOut()}><LogOut/> Sign Out</button>
                </div>
            </div>
        )
    }
}