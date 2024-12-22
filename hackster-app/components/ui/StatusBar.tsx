"use client";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";


export default function StatusBar() {
    const session = useSession();

    if (!session || session.status !== "authenticated") {
        return null;
    } else {
        return (
            <div className="absolute top-2 w-full mx-3 h-8 flex items-center">
                <span className="flex-grow">Logged in as {session.data.user?.name}</span>
                <button className="btn btn-sm btn-accent btn-outline float-end mx-5"><LogOut/> Sign Out</button>
            </div>
        )
    }
}