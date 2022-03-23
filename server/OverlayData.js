const SegmentData = require("./SegmentData");

class OverlayData{

    /**
     * 
     * @param {string[]} userList 
     * @param {string[]} segmentList 
     */
    constructor(userList, segmentList){
        this.startTime = 0;
        this.users = {};
        userList.forEach(user => {
            this.users[user] = segmentList.map(segment => new SegmentData(segment));
        })
    }

    start(){
        this.startTime = Date.now();
    }

    reset(){
        // TODO
    }

    /**
     * Stops the next segment for the given user
     * @param {string} user 
     */
    stopForUser(user){
        const part = this.users[user].find(segment => segment.time == 0);
        if(part){
            part.lockTime();
        }else{
            // finished!
        }
    }
}

module.exports = OverlayData;