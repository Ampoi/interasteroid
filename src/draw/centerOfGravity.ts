import p5, { Vector } from "p5"
import { rocket } from "../utils/rocket"
import { partSize } from "./config"

export const drawCenterOfGravity = (p: p5) => {
    p.translate(Vector.mult(rocket.constructed.centerOfGravity, partSize))

    const yellow = p.color(244, 214, 33)
    const black = p.color(0)
    const size = partSize * 0.4
    
    for( let i = 0; i<4; i++ ){
        const offset = Math.PI / 2 * i
        p.fill(i % 2 == 1 ? yellow : black)
        p.noStroke()
        p.arc(0, 0, size, size, 0 + offset, Math.PI/2 + offset)
    }

    p.translate(Vector.mult(rocket.constructed.centerOfGravity, -partSize))
}