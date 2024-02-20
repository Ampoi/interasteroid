import p5, { Vector } from "p5"
import { Part, PartName } from "./part"
import { generateUID } from "./uid"
import { createPart } from "./parts"
import { rocket } from "./rocket"
import { partSize } from "../draw/config"

export function getSamePositionParts(position: Vector): [id: string, part: Part][]{
    return Object.entries(rocket.bodyParts)
        .filter(([_, part]) => JSON.stringify(part.position) == JSON.stringify(position))
        .sort(([_a, { layer: layerA }], [_b, { layer: layerB }]) => layerB - layerA)
}

export function addPart(selectedPart: PartName, position: Vector){
    const id = generateUID()
    const samePositionTiles = getSamePositionParts(position)
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
                .filter(([_, tile]) => (tile.position.x + offset[0]) == position.x && (tile.position.y + offset[1]) == position.y)
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
            position,
            connectedToTile.layer,
            connectedToTile.id,
            selectedPart
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

export function deleteClickedPart(event: MouseEvent, position: Vector){
    event.preventDefault()
    const samePositionTiles = getSamePositionParts(position)
    const deleteTileData = samePositionTiles[0]
    
    if( deleteTileData && deleteTileData[0] != "heart" ){
        deletePart(deleteTileData[0])
    }
}

export const energyColor = "#0ac729"

class MousePositionFromCenter {
    readonly position = new Vector()
    readonly partPosition = new Vector()
    
    updatePosition(p: p5){
        this.position.x = p.mouseX - p.windowWidth / 2
        this.position.y = p.mouseY - p.windowHeight / 2

        this.partPosition.x = Math.round(this.position.x  / partSize)
        this.partPosition.y = Math.round(this.position.y  / partSize)
    }
}

export const mouseFromCenter = new MousePositionFromCenter()