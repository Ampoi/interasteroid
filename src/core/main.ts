import { rocket } from "../utils/rocket"

const tps = 50
export const startGame = () => {
    return setInterval(() => {
        Object.values(rocket.wires).forEach((wire) => {wire.energize()})
        rocket.position.add(rocket.velocity)
        rocket.angle += rocket.angleVelocity
    }, 1000 / tps)
}