import p5, { Vector } from "p5";
import { Part } from "../part";
import { Port } from "../port";
import { partSize } from "../draw";

export class Button extends Part {
    readonly name = "Button"
    readonly health = 100
    readonly energy: { readonly battery: { now: number; max: number; }; readonly ports: readonly Port[]; }

    constructor(...args: [Vector, number, string]){
        super(...args)
        const battery = {
            now: 0,
            max: 100
        }
        this.energy = {
            battery,
            ports: [ new Port(battery) ]
        }
    }

    customDrawFunc(p: p5): void {
        p.square(
            0, 0, partSize,
            partSize/5, partSize/5, partSize/5, partSize/5
        )
        p.fill(200, 0, 0)
        p.rect(0, -partSize*0.6, partSize*0.6, partSize*0.2)
    }

    action = () => {}
}