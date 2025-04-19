import {create} from "zustand/react";
import {persist} from "zustand/middleware";

interface PlayerStoreState {
    selectedPlaybackDeviceId: string
    setSelectedPlaybackDeviceId: (id: string) => void
}

export const usePlayerStore = create<PlayerStoreState>()(
    persist(
        (set) => ({
            selectedPlaybackDeviceId: "",
            setSelectedPlaybackDeviceId: (id) => set(() => ({ selectedPlaybackDeviceId: id})),
        }),
        { name: "playerStore" }
    )
)