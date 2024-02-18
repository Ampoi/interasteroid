import { Vector } from "p5"
import { rocket } from "./main"
import { Part } from "./part"

type ConstructedParts = { [key: string]: { position: Vector, angle: number, part: Part } }

function constructConnectedParts(parentPosition: Vector, parentAngle: number, partID: string, parentPart: Part, constructedParts: ConstructedParts){
    const part = rocket.bodyParts[partID]
    const offset  = Vector.sub(part.position, parentPart.position)
    const newPosition = Vector.add(
        parentPosition,
        Vector.add(
            Vector.fromAngle(Math.PI/2 + parentAngle).mult(offset.y),
            Vector.fromAngle(parentAngle).mult(offset.x)
        )
    )

    constructedParts[partID] = {
        position: newPosition,
        angle: parentAngle,
        part
    }

    Object.entries(rocket.bodyParts).forEach(([childPartID, childPart]) => {
        if(childPart.connectedToTileID == partID){
            constructConnectedParts(newPosition, parentAngle, childPartID, part, constructedParts)
        }
    })
}

export function constructParts(){
    const constructedParts: ConstructedParts = {}
    constructConnectedParts(rocket.position, rocket.angle, "heart", rocket.bodyParts.heart, constructedParts)

    return constructedParts
}