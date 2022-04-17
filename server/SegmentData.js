class SegmentData{

    /**
     * Data container for a part
     * @param {string} partName 
     */
    constructor(partName){
        this.name = partName;
        this.startTime = undefined;
        this.stopTime = undefined;
    }

    lock(){
        this.stopTime = Date.now();
    }

    start(){
        this.startTime = Date.now();
    }
}

module.exports = SegmentData