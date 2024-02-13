<template>
</template>
<script setup lang="ts">
import p5 from "p5"
import { Vector } from "p5"
import { computed, ref } from "vue";

import { partNames, type Part } from "./utils/part"
import { addPart, deleteClickedPart } from "./utils/main"
import { rocket } from "./utils/main"

const selectedPartIndex = ref(0)
const selectedPart = computed(() => partNames[selectedPartIndex.value])

const size = 40

function drawRelatedParts(p: p5, parentPosition: Vector, parentAngle: number, partID: string, parentPart: Part){
    const part = rocket.bodyParts[partID]
    const offset  = Vector.sub(part.position, parentPart.position)
    const newPosition = Vector.add(
        parentPosition,
        Vector.add(
            Vector.fromAngle(Math.PI/2 + parentAngle).mult(offset.y),
            Vector.fromAngle(parentAngle).mult(offset.x)
        )
    )
    part.draw(p, newPosition, parentAngle)

    Object.entries(rocket.bodyParts).forEach(([childPartID, childPart]) => {
        if(childPart.connectedToTileID == partID){
            drawRelatedParts(p, newPosition, parentAngle, childPartID, part)
        }
    })
}

const mousePositionFromCenter= new Vector(0, 0)

new p5((p: p5) => {
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.rectMode(p.CENTER)
    }

    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight)

    p.draw = () => {
        p.background(0)
        p.translate(p.windowWidth/2, p.windowHeight/2)

        drawRelatedParts(p, new Vector(0, 0), rocket.angle, "heart", rocket.bodyParts.heart)

        p.fill(0, 255, 255, 80)
        p.noStroke()
        p.square(mousePositionFromCenter.x * size, mousePositionFromCenter.y * size, size)
    }
    
    p.mouseMoved = () => {
        mousePositionFromCenter.x =  Math.round((p.mouseX - p.windowWidth / 2) / size)
        mousePositionFromCenter.y =  Math.round((p.mouseY - p.windowHeight / 2) / size)
    }

    p.mouseClicked = () => addPart(selectedPart.value, mousePositionFromCenter)
    document.oncontextmenu = (event: MouseEvent) => deleteClickedPart(event, mousePositionFromCenter)

    p.keyPressed = (event: KeyboardEvent) => {
        if(["1", "2", "3", "4"].includes(event.key)){
            selectedPartIndex.value =  Number(event.key)-1
        }
    }
})
</script>