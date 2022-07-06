const axios = require('axios');

class entityApiController {
    constructor() {
        return {
            getMatchPlayers: this.getMatchPlayers.bind(this),
            getMatchScore: this.getMatchScore.bind(this)
        }
    }
    async getMatchPlayers(real_matchkey) {
        try {
            const response = await axios.get(`http://rest.entitysport.com/v2/matches/${real_matchkey}/squads?token=1&token=d838e55bf823bc6e6ad46ba9c71106aa`);
            return response.data
        } catch (error) {
            throw error
        }
    }
    
    async getMatchScore(real_matchkey) {
        try {
            const response = await axios.get(`http://rest.entitysport.com/v2/matches/${real_matchkey}/scorecard?token=1&token=d838e55bf823bc6e6ad46ba9c71106aa`);
            return response.data
        } catch (error) {
            throw error
        }
    }
}

module.exports = new entityApiController();