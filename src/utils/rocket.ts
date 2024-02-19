import { Vector } from "p5"
import { Wire } from "./wire"
import { Part } from "./part"
import { createPart } from "./parts"

type Rocket = {
    angle: number
    angleVelocity: number
    centerOfGravity: Vector
    position: Vector
    velocity: Vector
    bodyParts: { [key: string]: Part }
    wires: { [key: string]: Wire }
}

export const rocket: Rocket = {
    angle: 0,
    angleVelocity: 0,
    centerOfGravity: new Vector(0, 0),
    position: new Vector(0, 0),
    velocity: new Vector(0, -10),
    bodyParts: {
        heart: createPart(new Vector(0, 0), 0, "rocket", "Battery")
    },
    wires: {}
}