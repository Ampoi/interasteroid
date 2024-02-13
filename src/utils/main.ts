import { Vector } from "p5"
import { Part, PartName, createPart } from "./part"
import { generateUID } from "./uid"
import { Wire } from "./wire"

export const rocket: {
    angle: number
    bodyParts: { [key: string]: Part }
    wires: { [key: string]: Wire }
} = {
    angle: 0,
    bodyParts: {
        heart: createPart(new Vector(0, 0), 0, "rocket", "Battery")
    },
    wires: {}
}

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