import { Vector } from "p5"
import { Wire } from "./wire"
import { Part } from "./part"
import { createPart } from "./parts"
import { constructParts } from "../core/constructParts"

class Rocket {
    readonly position = new Vector(0, 0)
    readonly velocity = new Vector(0, -20)
    
    readonly bodyParts: {
        [id: string]: Part
    } = {
        heart: createPart(new Vector(0, 0), 0, "rocket", "Battery")
    }

    readonly wires: {
        [id: string]: Wire
    } = {}

    angle = 0
    angleVelocity = 0

    get constructed(){
        return {
            parts: constructParts(this),
            get centerOfGravity(){
                const tmp = new Vector(0, 0)
                Object.values(this.parts).forEach((part) => {
                    tmp.add(part.position)
                })
                tmp.mult(1 / Object.keys(this.parts).length)
                return tmp
            }
        } as const
    }
}

export const rocket = new Rocket()

export { type Rocket }