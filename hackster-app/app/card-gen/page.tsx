"use client";
import { Printer } from "lucide-react";
import { useState } from "react";
import type { Template } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import cardTemplate from "@/lib/template_4x2_v2.json";
import { text, rectangle, barcodes } from '@pdfme/schemas';
import sdk from "@/lib/spotify-sdk/ClientInstance";
import _ from "lodash";

const colors = [
    "#e779c1",
    "#58c7f3",
    "oklch(88.04% 0.206 93.72)",
    "#71ead2",
    "#ec8c78",
]

export default function CardGeneratorPage() {
    const [spotifyPlaylistURI, setSpotifyPlaylistURI] = useState<string>("");

    function generateCardSheet() {
        // Get Playlist from Spotify
        console.log("Generating card sheet for playlist", spotifyPlaylistURI);

        sdk.playlists.getPlaylistItems(spotifyPlaylistURI).then((playlist) => {
            console.log("Got playlist", playlist);

            const template: Template = cardTemplate;
            const chunks = _.chunk(playlist.items, 8);
            const inputs = [];
            
            for (let k=0; k<chunks.length; k++) {
                let page_inputs = {};
                for (let i=0; i<chunks[k].length; i++) {
                    page_inputs[`card${i+1}_qr`] = chunks[k][i].track.uri;
                    page_inputs[`card${i+1}_title`] = chunks[k][i].track.name;
                    page_inputs[`card${i+1}_artist`] = chunks[k][i].track.artists[0].name;
                    page_inputs[`card${i+1}_year`] = chunks[k][i].track.album.release_date.split("-")[0];
                    page_inputs[`card${i+1}_background`] = {color: colors[Math.floor(Math.random() * colors.length)]};
                }
                inputs.push(page_inputs);
            }
            console.log(inputs);
            const plugins = { text, rectangle, qrcode: barcodes.qrcode };
            generate({ template, inputs, plugins }).then((pdf) => {
                const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
                window.open(URL.createObjectURL(blob));
            });
        });
    }

    return (
        <div className="grid grid-cols-1 gap-4 w-[600px]">
            <label className="form-control w-full">
                <div className="label">
                    <span className="label-text">Spotify Playlist URI</span>
                </div>
                <input type="text" className="input input-bordered" value={spotifyPlaylistURI} onChange={(e) => setSpotifyPlaylistURI(e.target.value)} />
            </label>
            <button className="btn btn-info" onClick={() => generateCardSheet()}><Printer /> Generate Card Sheet for printing</button>
        </div>
    )
}