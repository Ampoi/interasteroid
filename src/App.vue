<template>
    <p>mode: {{ mode }}</p>
    <p>part: {{ selectedPart }}</p>
</template>
<script setup lang="ts">
import p5 from "p5"
import { Vector } from "p5"
import { computed, ref } from "vue";

import { partNames } from "./utils/part"
import { addPart, deleteClickedPart } from "./utils/main"
import { rocket, getSamePositionParts } from "./utils/main"
import { generateUID } from "./utils/uid";
import { Wire } from "./utils/wire"
import { StarLayer } from "./utils/stars"
import { constructParts } from "./utils/constructParts"

const selectedPartIndex = ref(0)
const selectedPart = computed(() => partNames[selectedPartIndex.value])

const modes = ["build", "wire"] as const 
const modeIndex = ref(0)
const mode = computed(() => modes[modeIndex.value])

const size = 40

class MousePositionFromCenter {
    readonly position = new Vector()
    readonly partPosition = new Vector()
    
    updatePosition(p: p5){
        this.position.x = p.mouseX - p.windowWidth / 2
        this.position.y = p.mouseY - p.windowHeight / 2

        this.partPosition.x = Math.round(this.position.x  / size)
        this.partPosition.y = Math.round(this.position.y  / size)
    }
}

const mouseFromCenter = new MousePositionFromCenter()

let wireFrom: string | undefined = undefined
let stringingWire = false

const createWire = {
    start: () => {
        if( mode.value != "wire" ) return
        
        const samePositionParts = getSamePositionParts(mouseFromCenter.partPosition)
        const clickedPart = samePositionParts[0]
        if( clickedPart && clickedPart[1].energy ){
            wireFrom = clickedPart[0]
            stringingWire = true
        }
    },
    end: (p: p5) => {
        if( mode.value != "wire" ) return
        if( stringingWire && wireFrom ){
            mouseFromCenter.updatePosition(p)
            const samePositionParts = getSamePositionParts(mouseFromCenter.partPosition)
            const clickedPart = samePositionParts[0]

            if( clickedPart && clickedPart[1].energy ){
                const uid = generateUID()
                rocket.wires[uid] = new Wire({
                    partID: wireFrom,
                    portIndex: 0
                }, {
                    partID: clickedPart[0],
                    portIndex: 0
                })
            }
        }
        wireFrom = undefined
        stringingWire = false
    }
} as const

new p5((p: p5) => {
    const starLayers= [
        new StarLayer(1000, 100),
        new StarLayer(1000, 200),
        new StarLayer(1000, 400)
    ]

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.rectMode(p.CENTER)
    }

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
        starLayers.forEach(layer => layer.resize(Math.sqrt(((p.width / 2) ** 2) + ((p.height / 2) ** 2))))
    }

    p.draw = () => {
        p.background(0)
        p.translate(p.windowWidth/2, p.windowHeight/2) //画面中央へ0, 0を移動
        p.rotate(-rocket.angle)
        
        starLayers.forEach((starLayer) => {
            starLayer.updateStars()
            starLayer.draw(p)
        })

        p.translate(-rocket.position.x*size, -rocket.position.y*size) //ロケットの中身を0, 0にする

        p.textSize(16)
        const constructedParts = constructParts()
        
        Object.values(constructedParts).forEach(({ position, angle, part }) => {
            part.draw(p, position, angle)
            if( part.action ) part.action()
        })
        Object.values(rocket.wires).forEach((wire) => {
            wire.draw(p, constructedParts)
            wire.energize()
        })

        p.translate(rocket.position.x*size, rocket.position.y*size)
        p.rotate(rocket.angle)

        p.fill(0, 255, 255, 80)
        p.noStroke()
        p.square(mouseFromCenter.partPosition.x * size, mouseFromCenter.partPosition.y * size, size)

        rocket.position.add(rocket.velocity)
        rocket.angle += rocket.angleVelocity
    }
    
    p.mouseMoved = () => mouseFromCenter.updatePosition(p)

    p.mousePressed = createWire.start
    p.mouseReleased = () => createWire.end(p)

    p.mouseClicked = () => {
        if( mode.value == "build" ){
            addPart(selectedPart.value, mouseFromCenter.partPosition)
        }
    }
    document.oncontextmenu = (event: MouseEvent) => deleteClickedPart(event, mouseFromCenter.partPosition)

    p.keyPressed = (event: KeyboardEvent) => {
        if( event.key == "f" ){
            modeIndex.value = (modeIndex.value + 1) % modes.length
        }
        if(Array.from({length: partNames.length}).map((_, i) => (i + 1).toString()).includes(event.key)){
            selectedPartIndex.value =  Number(event.key) - 1
        }
    }
})
</script>