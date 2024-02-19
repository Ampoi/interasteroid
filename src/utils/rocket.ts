import { Vector } from "p5"
import { Wire } from "./wire"
import { Part } from "./part"
import { createPart } from "./parts"

export const rocket: {
    angle: number
    angleVelocity: number
    position: Vector
    velocity: Vector
    bodyParts: { [key: string]: Part }
    wires: { [key: string]: Wire }
} = {
    angle: 0,
    angleVelocity: 0,
    position: new Vector(0, 0),
    velocity: new Vector(0, -10),
    bodyParts: {
        heart: createPart(new Vector(0, 0), 0, "rocket", "Battery")
    },
    wires: {}
}