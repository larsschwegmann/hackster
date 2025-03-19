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
import SpotifyConnectPlayer from "@/components/SpotifyConnectPlayer";
import {usePlayerStore} from "@/lib/playerStore";

export default function Home() {

    /*
    TODO: make player reconnect on idle timeout
    TODO: refresh token on timeout
    TODO: fix playback device selection
    TODO: fix issue, when browser goes into background, page is refreshed and new player is created
    */

    const session = useSession();
    const [isScanning, setScanning] = useState(false);
    const [webPlayerDeviceId, setWebPlayerDeviceId] = useState<string | undefined>(undefined);
    const [selectedPlaybackDevice, setSelectedPlaybackDevice] = useState<Device | undefined>(undefined);
    const { selectedPlaybackDeviceId, setSelectedPlaybackDeviceId } = usePlayerStore();
    const [availablePlaybackDevices, setAvailablePlaybackDevices] = useState<Device[]>([]);

    const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);

    // Automatically Update Available Playback Devices + Default device when session or player changes
    useEffect(() => {
        if (!session || session.status !== "authenticated") {
            setAvailablePlaybackDevices([]);
            return;
        }
        sdk.player.getAvailableDevices().then(devices => {
            setAvailablePlaybackDevices(devices.devices);    
            if (!selectedPlaybackDevice) {
                if (selectedPlaybackDeviceId) {
                    setSelectedPlaybackDevice(devices.devices.find(device => device.id === selectedPlaybackDeviceId));
                } else {
                    setSelectedPlaybackDevice(devices.devices.find(device => device.id === webPlayerDeviceId));
                }
            }
        });
        if (selectedPlaybackDevice?.id) {
            setSelectedPlaybackDeviceId(selectedPlaybackDevice.id);
        }
    }, [session, selectedPlaybackDevice, webPlayerDeviceId])

    if (!session || session.status !== "authenticated") {
        return <SignIn />
    }

    function onDataScan(data: string)  {
        setScanning(false);
        decodeQRData(data).then(async (spotifyURI) => {
            const trimmedSpotifyURI = spotifyURI?.trim();
            console.log("Found QR track: ", trimmedSpotifyURI);
            if (selectedPlaybackDevice && trimmedSpotifyURI) {
                await sdk.player.startResumePlayback(selectedPlaybackDevice.id!, undefined, [trimmedSpotifyURI]);
            }
        });
    }

    function openScanner() {
        player?.activateElement(); 
        setScanning(true);
    }


    return (
        <div className="grid grid-cols-1 gap-4">
            { isScanning ? <div><QRScanner onDataScan={onDataScan} onCancel={() => setScanning(false)}/></div> : null}
            <SpotifyWebPlayer setDeviceId={setWebPlayerDeviceId} hideUI={isScanning || webPlayerDeviceId !== selectedPlaybackDevice?.id} setSpotifyPlayer={setPlayer} />
            <SpotifyConnectPlayer hideUI={isScanning || webPlayerDeviceId === selectedPlaybackDevice?.id} spotifyDeviceId={selectedPlaybackDevice?.id ?? ""} />
            { !isScanning ? <button className="btn btn-lg btn-primary mt-5" onClick={openScanner}><ScanQrCode /> Scan New Track</button> : null }
            <div>
                <span className="mr-3">Playback Device:</span>
                <select className="select select-bordered select-sm" value={selectedPlaybackDevice?.id ?? undefined} onChange={(e) => setSelectedPlaybackDevice(availablePlaybackDevices.find((d) => d.id === e.target.value))}>
                    {availablePlaybackDevices.map(device => (
                        <option key={device.id} value={device.id?.toString()}>{device.name} {device.id === webPlayerDeviceId ? "(This Browser)" : null}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}