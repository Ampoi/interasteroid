import { computed, ref } from "vue"
import { partNames } from "../utils/part"

export const modes = ["build", "wire"] as const 
export const modeIndex = ref(0)
export const mode = computed(() => modes[modeIndex.value])

const selectedPartIndex = ref(0)
export const selectedPart = computed(() => partNames[selectedPartIndex.value])

export const switchMode = (event: KeyboardEvent) => {
    if( event.key == "f" ){
        modeIndex.value = (modeIndex.value + 1) % modes.length
    }
    if(Array.from({length: partNames.length}).map((_, i) => (i + 1).toString()).includes(event.key)){
        selectedPartIndex.value =  Number(event.key) - 1
    }
}