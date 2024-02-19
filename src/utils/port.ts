import { Vector } from "p5"
import { partEnergyCircleSize } from "../draw/main"

export const getPortPosition = (portIndex: number, portAmount: number) => {
    const reversedPortPosition = Vector.fromAngle((portIndex / portAmount + 1/4) * Math.PI * 2).mult(( partEnergyCircleSize.inner + partEnergyCircleSize.outer ) / 4)
    return new Vector(
        reversedPortPosition.x,
        -reversedPortPosition.y
    )
}

export class Port {
    powerIsOn = false
    
    constructor(
        public readonly battery: { now: number, max: number },
        chargeCustomFunc?: (_charge: Port["_charge"], energy: number) => void,
        useCustomFunc?: (_use: Port["_use"], energy: number) => number
    ){
        if( chargeCustomFunc ) this.chargeBattery = ( energy: number ) => chargeCustomFunc(this._charge, energy)
        if( useCustomFunc ) this.useBattery = ( energy: number ) => useCustomFunc(this._use, energy)
    }

    private readonly _charge = (energy: number) => {
        if( !this.battery ) throw new Error("バッテリーが存在しないので充電できません！")
        const newBattery = this.battery.now + energy
        this.battery.now = newBattery > this.battery.max ? this.battery.max : newBattery
        this.powerIsOn = true
    }

    public chargeBattery(energy: number){
        this._charge(energy)
    }

    private readonly _use = (energy: number) => {
        if( !this.battery ) throw new Error("バッテリーが存在しないので使用できません！")
        if( this.battery.now < energy ){
            const remainEnergy = this.battery.now
            this.battery.now = 0
            return remainEnergy
        }else{
            this.battery.now -= energy
            return energy
        }
    }

    public useBattery(energy: number){
        return this._use(energy)
    }
}