import p5, { Vector } from "p5";
import { Part } from "../part";
import { Port } from "../port";
import { partSize } from "../draw";

export class Engine extends Part {
    readonly name = "Engine"
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
        p.arc(0, partSize/2, partSize*4/5, partSize*5/4, p.PI, 0)
        p.rect(
            0, -partSize/4, partSize, partSize/2,
            partSize/5, partSize/5, partSize/5, partSize/5
        )

        if( this.isOn ){
            p.noStroke()
            p.fill(0, 100, 250)
            p.triangle(partSize*2/5, partSize/2, 0, partSize*1.5, -partSize*2/5, partSize/2)
        }
    }

    private isOn = false
    private readonly useBatteryAmount = 2

    readonly action = () => {
        if( this.energy.battery.now > 0  ){
            this.isOn = true
            this.energy.ports[0].useBattery(this.useBatteryAmount)
            //TODO: ロケットの加速をする
        }else{
            this.isOn = false
        }
    }
}