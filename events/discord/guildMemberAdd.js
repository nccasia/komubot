module.exports = {
    async execute(e, client) {
        console.log("[32m%s[0m", "NEW GUILD ", "[0m", `${e.name} [${e.memberCount.toLocaleString()} Members]\nID: ${e.id}`)        
    }
};