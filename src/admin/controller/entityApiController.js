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
            const response = await axios.get(`http://rest.entitysport.com/v2/matches/${real_matchkey}/squads?token=1&token=1f56fecf67b5dee16cbdba41eb87bd2e`);
            return response.data
        } catch (error) {
            throw error
        }
    }
    
    async getMatchScore(real_matchkey) {
        try {
            const response = await axios.get(`http://rest.entitysport.com/v2/matches/${real_matchkey}/scorecard?token=1&token=1f56fecf67b5dee16cbdba41eb87bd2e`);
            return response.data
        } catch (error) {
            throw error
        }
    }
}

module.exports = new entityApiController();