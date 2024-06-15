
class Player {
    constructor(id) {
        this.id = id;
        this.minDistance = 0;
        this.maxDistance = 0;
        this.time = 0;
    }

    setMinDistance(distance) {
        this.minDistance = distance;
    }

    setMaxDistance(distance) {
        this.maxDistance = distance;
    }

    setTime(time) {
        this.time = time;
    }
}

export default Player;
