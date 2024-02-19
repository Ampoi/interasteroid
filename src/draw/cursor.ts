import p5, { Vector } from "p5"
import { mouseFromCenter } from "../utils/main"
import { partSize } from "./main"

export const drawCursor = (p: p5) => {
    p.translate(Vector.mult(mouseFromCenter.partPosition, partSize))
    
    p.noFill()
    p.strokeWeight(2)
    p.stroke(255, 100)
    p.square(
        0, 0, partSize,
        partSize/5, partSize/5, partSize/5, partSize/5
    )
    
    p.translate(Vector.mult(mouseFromCenter.partPosition, -partSize))
}