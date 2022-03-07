const e = require("express");

class OverlayData {

    constructor(users) {
        this.startTime = Date.now();
        this.userData = {};

        if (users) {
            users.forEach(user => {
                this.userData[user] = {
                    timerParts: []
                };
            });
        }
    }

    startTimer () {
        this.startTime = Date.now();
        for (var user in this.userData) {
            this.userData[user].timerParts[0].startTime = this.startTime;
        }
    }

    update (user, partName) {
        console.log(this.userData)
        let idx = this.userData[user].timerParts.findIndex((part) => { return part.stopName == partName; });
        if (idx >= 0) {
            this.userData[user].timerParts[idx].stopTime = Date.now();
        }
        if ((idx + 1) < this.userData[user].timerParts.length) {
            this.userData[user].timerParts[idx + 1].startTime = Date.now();
        }
        return this;
    }

    reset(users, parts) {
        this.userData = {};
        if (users) {
            users.forEach(user => {
                let partList = [];
                if (parts) {
                    parts.forEach(partName => {
                        partList.push({ stopName: partName });
                    });
                }
                this.userData[user] = {
                    timerParts: partList
                };
            });
        }
        else {
            for (var user in this.userData) {
                let partList = [];
                if (parts) {
                    parts.forEach(partName => {
                        partList.push({ stopName: partName });
                    });
                }
                this.userData[user] = {
                    timerParts: partList
                };
            }
        }
        return this;
    }
}

module.exports = OverlayData;