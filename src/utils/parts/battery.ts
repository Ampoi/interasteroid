import p5, { Vector } from "p5";
import { Part } from "../part";
import { Port } from "../port";
import { partSize } from "../../draw/config";

export class Battery extends Part {
    readonly name = "Battery"
    readonly health = 100
    readonly energy: { readonly battery: { now: number; max: number; }; readonly ports: readonly Port[]; }

    constructor(...args: [Vector, number, string]){
        super(...args)
        const battery = {
            now: 2000,
            max: 2000
        }
        this.energy = {
            battery,
            ports: [ new Port(battery) ]
        }
    }
    
    customDrawFunc(p: p5): void {
        p.fill(100)
        p.square(
            0, 0, partSize,
            partSize/5, partSize/5, partSize/5, partSize/5
        )
    }

    action?: (() => void) | undefined;
}