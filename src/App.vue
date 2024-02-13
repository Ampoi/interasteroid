<template>
</template>
<script setup lang="ts">
import p5 from "p5"
import { Vector } from "p5"
import { generateUID } from "./utils/uid"
import { computed, ref } from "vue";

import { createPart, partNames, type Part } from "./utils/part"

const selectedPartIndex = ref(0)
const selectedPart = computed(() => partNames[selectedPartIndex.value])

const rocket: {
    angle: number
    bodyParts: { [key: string]: Part }
} = {
    angle: Math.PI/4,
    bodyParts: {
        heart: createPart(new Vector(0, 0), 0, "rocket", "Battery")
    }
}

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

function getSamePositionParts(position: Vector): [id: string, part: Part][]{
    return Object.entries(rocket.bodyParts)
        .filter(([_, part]) => JSON.stringify(part.position) == JSON.stringify(position))
        .sort(([_a, { layer: layerA }], [_b, { layer: layerB }]) => layerB - layerA)
}

function addPart(){
    const id = generateUID()
    const samePositionTiles = getSamePositionParts(mousePositionFromCenter)
    const belowTile = samePositionTiles[0]
    const connectedToTile: {
        id: string
        layer: number
    } | undefined = (() => {
        if(belowTile) return {
            id: belowTile[0],
            layer: belowTile[1].layer + 1
        }

        const availablePositions = [[0, 1], [1, 0], [-1, 0], [0, -1]]
        let newConnectedToTile: {id: string, layer: number} | undefined = undefined
        for(const offset of availablePositions){
            const connectableTile = Object.entries(rocket.bodyParts)
                .filter(([_, tile]) => (tile.position.x + offset[0]) == mousePositionFromCenter.x && (tile.position.y + offset[1]) == mousePositionFromCenter.y)
                .sort(([_a,partA], [_b,partB]) => partB.layer - partA.layer)[0]

            if( connectableTile ){
                newConnectedToTile = {
                    id: connectableTile[0],
                    layer: connectableTile[1].layer
                }
                break
            }
        }

        if( !newConnectedToTile ) return

        return newConnectedToTile
    })()

    if( connectedToTile ){
        rocket.bodyParts[id] = createPart(
            mousePositionFromCenter,
            connectedToTile.layer,
            connectedToTile.id,
            selectedPart.value
        )
    }
}

function deletePart(id: string){
    delete rocket.bodyParts[id]
    Object.entries(rocket.bodyParts).forEach(([partID, bodyParts]) => {
        if( bodyParts.connectedToTileID == id ){
            deletePart(partID)
        }
    })
}

function deleteClickedPart(event: MouseEvent){
    event.preventDefault()
    const samePositionTiles = getSamePositionParts(mousePositionFromCenter)
    const deleteTileData = samePositionTiles[0]
    
    if( deleteTileData && deleteTileData[0] != "heart" ){
        deletePart(deleteTileData[0])
    }
}

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
        console.log("hi!")
        mousePositionFromCenter.x =  Math.round((p.mouseX - p.windowWidth / 2) / size)
        mousePositionFromCenter.y =  Math.round((p.mouseY - p.windowHeight / 2) / size)
    }

    p.mouseClicked = addPart
    document.oncontextmenu = deleteClickedPart

    p.keyPressed = (event: KeyboardEvent) => {
        if(["1", "2", "3", "4"].includes(event.key)){
            selectedPartIndex.value =  Number(event.key)-1
        }
    }
})
</script>