const AdminModel = require('../models/adminModel');

module.exports = class GetBonus {
    async getBonus(type, verify) {
        let getBouns;
        const superadmin = await AdminModel.findOne({ role: '0' });
        // console.log(`superadmin`, superadmin, `------type-------${type}-------------, ${verify}`);
        getBouns = superadmin.general_tabs;

        const bonus = getBouns.find((item) => item.type === type);
        console.log(`bonus`, bonus);
        return bonus && verify == 0 ? bonus.amount : 0;
    }
}