"use client";
import SpotifyWebPlayer from "@/components/SpotifyWebPlayer";
import sdk from "@/lib/spotify-sdk/ClientInstance";
import { useSession } from 'next-auth/react';
import { decodeQRData } from "@/lib/hacksterPlaylists";
import SignIn from "@/components/ui/SignIn";
import { useState, useEffect } from "react";
import { ScanQrCode } from "lucide-react";
import { Device } from "@spotify/web-api-ts-sdk";
import QRScanner from "@/components/ui/QRScanner";

export default function Home() {

    const session = useSession();
    const [isScanning, setScanning] = useState(false);
    const [webPlayerDeviceId, setWebPlayerDeviceId] = useState<string | undefined>(undefined);
    const [selectedPlaybackDevice, setSelectedPlaybackDevice] = useState<Device | undefined>(undefined);
    const [availablePlaybackDevices, setAvailablePlaybackDevices] = useState<Device[]>([]);

    // @ts-ignore
    const [player, setPlayer] = useState(undefined);

    // Automatically Update Available Playback Devices + Default device when session or player changes
    useEffect(() => {
        if (!session || session.status !== "authenticated") {
            setAvailablePlaybackDevices([]);
            return;
        }
        const devices = sdk.player.getAvailableDevices().then(devices => {
            setAvailablePlaybackDevices(devices.devices);    
            if (!selectedPlaybackDevice) {
                setSelectedPlaybackDevice(devices.devices.find(device => device.id === webPlayerDeviceId));
            }
        });
    }, [session, selectedPlaybackDevice, webPlayerDeviceId])

    if (!session || session.status !== "authenticated") {
        return <SignIn />
    }

    function onDataScan(data: string)  {
        decodeQRData(data).then(async (spotifyURI) => {
            console.log("Want to play song: ", spotifyURI);
            if (selectedPlaybackDevice && spotifyURI) {
                await sdk.player.startResumePlayback(selectedPlaybackDevice.id!, undefined, [spotifyURI]);
                setScanning(false);
            }
        });
    }

    function openScanner() {
        // @ts-ignore
        player?.activateElement(); 
        setScanning(true);
    }


    return (
       
        <div className="grid grid-cols-1 gap-4">
             {/* <button onClick={async () => {
        const devices = await sdk.player.getAvailableDevices()
        console.log(devices)
        const device = devices.devices.find(device => device.name === "hackster")
        console.log(spotifyURIFromURL(histerPlaylists[0].spotifyURL))
        await sdk.player.startResumePlayback(device!.id!, spotifyURIFromURL(histerPlaylists[0].spotifyURL))
      }}>Play a great song</button> */}

            { isScanning ? <div><QRScanner onDataScan={onDataScan} onCancel={() => setScanning(false)}/></div> : null}
            <SpotifyWebPlayer deviceId={webPlayerDeviceId} setDeviceId={setWebPlayerDeviceId} hideUI={isScanning} setSpotifyPlayer={setPlayer} />
            { !isScanning ? <button className="btn btn-lg btn-primary mt-5" onClick={openScanner}><ScanQrCode /> Scan New Track</button> : null }
            <div>
                <span className="mr-3">Playback Device:</span>
                <select className="select select-bordered select-sm" value={webPlayerDeviceId} onChange={(e) => setWebPlayerDeviceId(e.target.value)}>
                    {availablePlaybackDevices.map(device => (
                        <option key={device.id} value={device.id?.toString()}>{device.name} {device.id === webPlayerDeviceId ? "(This Browser)" : null}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}