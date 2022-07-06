class errorController {
    constructor() {
        return {
            errorPage: this.errorPage.bind(this)
        }
    }
    async errorPage(req, res, next) {
        try {
            res.render("viewError");
        } catch (error) {
            throw error
        }
    }
}

module.exports = new errorController();