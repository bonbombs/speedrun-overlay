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
        this.reset = function(){
            userList.forEach(user => {
                this.users[user] = segmentList.map(segment => new SegmentData(segment));
            });
        }
        this.reset();
    }

    start(){
        this.startTime = Date.now();
        for(const [username, user] of Object.entries(this.users)) {
            const firstPart = user.find(segment => segment.startTime == 0);
            if(firstPart){
                firstPart.start();
            }
        }
    }

    /**
     * Stops the next segment for the given user
     * @param {string} user 
     */
    stopForUser(user){
        const part = this.users[user].find(segment => segment.stopTime == 0);
        if(part){
            part.lock();
            const nextPart = this.users[user].find(segment => segment.startTime == 0);
            if(nextPart){
                nextPart.start();
            }
        }else{
            // finished!
        }
    }
}

module.exports = OverlayData;