import p5 from "p5"
import { Part } from "../part"
import { partSize } from "../../engine/main"

export class Block extends Part {
    readonly name = "Block"
    readonly health = 100
    readonly energy = undefined

    customDrawFunc(p: p5): void {
        p.square(
            0, 0, partSize,
            partSize/5, partSize/5, partSize/5, partSize/5
        )
    }

    readonly action = undefined
}