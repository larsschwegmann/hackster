"use client";
import {FileSpreadsheet, Printer} from "lucide-react";
import {useState} from "react";
import type {Template} from '@pdfme/common';
import {generate} from '@pdfme/generator';
import cardTemplate from "@/lib/template_4x2_v2.json";
import {barcodes, rectangle, text} from '@pdfme/schemas';
import _ from "lodash";
import {getAllPlaylistItems} from "@/lib/utils";
import {FileWithPath, useDropzone} from "react-dropzone";

const colors = [
    "#e779c1",
    "#58c7f3",
    "#ffd200",
    "#71ead2",
    "#ec8c78",
]

type PlaylistTrackType = {
    title: string,
    year: number,
    artist: string,
    spotifyURI: string,
    spotifyLink: string,
};

function getSpotifyPlaylistIDFromURL(url: string) {
    const match = url.match(/^https:\/\/open.spotify.com\/playlist\/([A-Za-z0-9]+)/)
    if (match) {
        return match[1];
    }

    return null;
}

async function getPlaylistDataFromSpotify(playlistId: string) {
    const data = await getAllPlaylistItems(playlistId);
    return data.map((playlistItem) => {
        return {
            title: playlistItem.track.name,
            year: parseInt(playlistItem.track.album.release_date.split("-")[0]),
            artist: playlistItem.track.artists[0].name,
            spotifyURI: playlistItem.track.uri,
            spotifyLink: playlistItem.track.external_urls.spotify,
        } as PlaylistTrackType
    })
}

async function generateCardSheetFromPlaylistTracks(playlist: PlaylistTrackType[]) {
    const template: Template = cardTemplate;
    const chunks = _.chunk(playlist, 8);
    const inputs = [];

    for (let k=0; k<chunks.length; k++) {
        const page_inputs = {};
        for (let i=0; i<chunks[k].length; i++) {
            // @ts-expect-error blah
            page_inputs[`card${i+1}_qr`] = chunks[k][i].spotifyURI;
            // @ts-expect-error blah
            page_inputs[`card${i+1}_title`] = chunks[k][i].title;
            // @ts-expect-error blah
            page_inputs[`card${i+1}_artist`] = chunks[k][i].artist;
            // @ts-expect-error blah
            page_inputs[`card${i+1}_year`] = chunks[k][i].year.toString();
            // @ts-expect-error blah
            page_inputs[`card${i+1}_background`] = {color: colors[Math.floor(Math.random() * colors.length)]};
        }
        inputs.push(page_inputs);
    }
    console.log(inputs);
    const plugins = { text, rectangle, qrcode: barcodes.qrcode };
    generate({ template, inputs, plugins }).then((pdf) => {
        // @ts-expect-error blah
        const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
        window.open(URL.createObjectURL(blob));
    });
}

export default function CardGeneratorPage() {
    const [spotifyPlaylistURL, setSpotifyPlaylistURL] = useState<string>("");
    const {getRootProps, getInputProps} = useDropzone({
        accept: {
            "text/tab-seperated-values": [".tsv"]
        },
        multiple: false,
        onDrop: async (acceptedFiles) => {
            await importTSV(acceptedFiles);
        }
    });

    async function generateCardSheet() {
        // Get Playlist from Spotify
        console.log("Generating card sheet for playlist", spotifyPlaylistURL);
        const playlistId = getSpotifyPlaylistIDFromURL(spotifyPlaylistURL);
        if (!playlistId) {
            return;
        }
        console.log("Found playlist ID: ", playlistId);
        const data = await getPlaylistDataFromSpotify(playlistId);

        await generateCardSheetFromPlaylistTracks(data);
    }

    async function exportTSV() {
        const playlistId = getSpotifyPlaylistIDFromURL(spotifyPlaylistURL);
        if (!playlistId) {
            return;
        }

        const data = await getPlaylistDataFromSpotify(playlistId);

        let tsvData = "artist\ttitle\tyear\tspotify-link\tspotify-uri\n";
        for (const track of data) {
            tsvData += `${track.artist}\t${track.title}\t${track.year}\t${track.spotifyLink}\t${track.spotifyURI}\n`
        }

        const a = document.createElement("a");
        const blob = new Blob([tsvData], { type: 'text/tab-separated-values' });
        const blobURL = URL.createObjectURL(blob);
        a.setAttribute("href", blobURL);
        a.setAttribute("download", "hackster-tracks.tsv");
        a.click();
    }

    async function importTSV(acceptedFiles: FileWithPath[]) {
        const last = acceptedFiles[acceptedFiles.length - 1];
        const fileContents = await last.text();
        const tracks = fileContents.split("\n").map((line) => {
            const lineItems = line.split("\t");
            if (lineItems[0] === "artist") {
                return undefined;
            }
            return {
                artist: lineItems[0],
                title: lineItems[1],
                year: parseInt(lineItems[2]),
                spotifyLink: lineItems[3],
                spotifyURI: lineItems[4],
            } as PlaylistTrackType
        }).filter(track => track);
        console.log(`Generating PDF for ${tracks.length - 1} tracks from tsv file`);
        await generateCardSheetFromPlaylistTracks(tracks as PlaylistTrackType[]);
    }

    return (
        <div className="grid grid-cols-1 gap-4 w-[600px]">
            <label className="form-control w-full">
                <div className="label">
                    <span className="label-text">Link to Spotify Playlist</span>
                </div>
                <input type="text" className="input input-bordered" value={spotifyPlaylistURL} onChange={(e) => setSpotifyPlaylistURL(e.target.value)} />
            </label>
            <div className="flex flex-row gap-2 w-full">
                <button className="btn btn-info flex-1 flex-grow" onClick={() => generateCardSheet()}><Printer /> Generate Card Sheet for printing</button>
                <button className="btn btn-accent flex-1 flex-grow" onClick={() => exportTSV()}><FileSpreadsheet /> Export CSV</button>
            </div>
            <div {...getRootProps({className: "flex flex-row gap-2 w-full h-[200px]"})}>
                <input {...getInputProps()} />
                <p className="">Or: drag and drop a TSV file here, or click here to select one</p>
            </div>
        </div>
    )
}