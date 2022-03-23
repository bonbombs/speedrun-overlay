class SegmentData{

    /**
     * Data container for a part
     * @param {string} partName 
     */
    constructor(partName){
        this.name = partName;
        this.timestamp = 0;
    }

    lockTime(){
        this.timestamp = Date.now();
    }

    get time(){
        return this.timestamp;
    }

}

module.exports = SegmentData