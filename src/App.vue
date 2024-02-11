<template>
    {{ selectedItem }}
</template>
<script setup lang="ts">
import p5 from "p5"
import { generateUID } from "./utils/uid"
import { computed, ref } from "vue";

type Vector = Record<"x" | "y", number>

const items = ["block", "motor", "engine", "battery"] as const
const selectedItemIndex = ref(0)
const selectedItem = computed(() => items[selectedItemIndex.value])

type PartType = typeof items[number]

type Part = {
    type: PartType
    position: Vector
    health: number
    layer: number
    connectedToTileID: string
}

const rocket: {
    angle: number
    bodyParts: { [key: string]: Part }
} = {
    angle: 0,
    bodyParts: {
        heart: {
            type: "block",
            health: 100,
            layer: 0,
            connectedToTileID: "rocket",
            position: {x: 0, y: 0}
        }
    }
}

const size = 40

function drawPart(p: p5, type: PartType, position: Vector, rotate: number, layer: number ){
    p.translate(position.x*size, position.y*size)
    p.strokeWeight(2)

    if( type == "battery" ){
        p.fill("#00ab55")
        p.stroke("#004d26")
    }else{
        p.fill(200)
        p.stroke(150)
    }


    if( type == "engine" ){
        p.arc(0, size/2, size*4/5, size*5/4, p.PI, 0)
        p.rect(
            0, -size/4, size, size/2,
            size/5, size/5, size/5, size/5
        )
    }else{
        p.square(
            0, 0, size,
            size/5, size/5, size/5, size/5
        )
    }

    if( type != "block" ){
        p.fill(250)
        p.circle(0, 0, size * 0.7)
    }

    p.textAlign(p.CENTER)
    p.noStroke()
    p.fill(0)
    p.text(layer, 0, 0)
    
    p.translate(-position.x*size, -position.y*size)
}

function drawRelatedParts(p: p5, parentPosition: Vector, partID: string, parentPart: Part){
    const part = rocket.bodyParts[partID]
    const newPosition = {
        x: parentPosition.x + (part.position.x - parentPart.position.x),
        y: parentPosition.y + (part.position.y - parentPart.position.y)
    }
    drawPart(p, part.type, newPosition, 0, part.layer)

    Object.entries(rocket.bodyParts).forEach(([childPartID, childPart]) => {
        if(childPart.connectedToTileID == partID){
            drawRelatedParts(p, newPosition, childPartID, part)
        }
    })
}

const mousePositionFromCenter: Vector = {x: 0, y: 0}

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

    if( !connectedToTile ) return

    rocket.bodyParts[id] = {
        layer: connectedToTile.layer,
        type: selectedItem.value,
        position: JSON.parse(JSON.stringify(mousePositionFromCenter)),
        health: 100,
        connectedToTileID: connectedToTile.id
    }
}

function deletePart(event: MouseEvent){
    event.preventDefault()
    const samePositionTiles = getSamePositionParts(mousePositionFromCenter)
    const deleteTileData = samePositionTiles[0]
    
    if( deleteTileData && deleteTileData[0] != "heart" ) delete rocket.bodyParts[deleteTileData[0]]
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

        drawRelatedParts(p, {x:0, y:0}, "heart", rocket.bodyParts.heart)

        p.fill(0, 255, 255, 80)
        p.noStroke()
        p.square(mousePositionFromCenter.x * size, mousePositionFromCenter.y * size, size)
    }
    
    p.mouseMoved = () => {
        mousePositionFromCenter.x =  Math.round((p.mouseX - p.windowWidth / 2) / size)
        mousePositionFromCenter.y =  Math.round((p.mouseY - p.windowHeight / 2) / size)
    }

    p.mouseClicked = addPart
    document.oncontextmenu = deletePart

    p.keyPressed = (event: KeyboardEvent) => {
        if(["1", "2", "3", "4"].includes(event.key)){
            selectedItemIndex.value =  Number(event.key)-1
        }
    }
})
</script>