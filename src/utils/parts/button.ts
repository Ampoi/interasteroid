import p5, { Vector } from "p5";
import { Part } from "../part";
import { Port } from "../port";
import { partSize } from "../../draw/config";
import { getSamePositionParts, mouseFromCenter } from "../main";

export class Button extends Part {
    readonly name = "Button"
    readonly health = 100
    readonly energy: { readonly battery: { now: number; max: number; }; readonly ports: readonly Port[]; }

    public isPressed = false

    constructor(...args: [Vector, number, string]){
        super(...args)
        const battery = {
            now: 0,
            max: 100
        }
        this.energy = {
            battery,
            ports: [
                new Port(battery, undefined, (use, energy) => {
                    if( this.isPressed ){
                        const usedEnergy = use(energy)
                        return usedEnergy
                    }else{
                        return 0
                    }
                })
            ]
        }
    }

    customDrawFunc(p: p5): void {
        p.fill(this.isPressed ? 150 : 200, 0, 0)
        p.square(
            0, 0, partSize,
            partSize/5, partSize/5, partSize/5, partSize/5
        )
    }

    action = (_: p5, myID: string) => {
        const me = getSamePositionParts(mouseFromCenter.partPosition).find(([id]) => myID == id)
        this.isPressed = !!me
    }
}