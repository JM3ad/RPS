class Bot {
    constructor() {
        this.dUses = 0
    }

    makeMove(gamestate) {
        var number = Math.floor(Math.random() * 3)
        if(this.lastRoundADraw(gamestate)){
            number = 3 
        }
        var moves = ['R','S','P','D','W']
        if(number == 3){
            this.dUses ++;
        }
        if(this.dUses >= 100) {
            return moves[Math.floor(Math.random() * 3)]
        }
        return moves[number]
    }

    lastRoundADraw(gamestate){
        var length = gamestate.rounds.length
        if(length != 0){
            if(gamestate.rounds[length-1].p1 == gamestate.rounds[length-1].p2){
                return true
            }
        }
        return false;
    }

   /* firstRoundADraw(gamestate){
        if(gamestate.rounds[0].p1==gamestate.rounds[0].p2){
            return true
        }
        return false
    }*/
} 

module.exports = new Bot();

function testBots() {
    var bot = new Bot()
    var otherBot = new Bot()
    var gamestate = { rounds: [] }
    var gamestate2 = { rounds: [] }
    for (var i = 0; i < 1999; i++) {
        var move1 = bot.makeMove(gamestate)
        var move2 = otherBot.makeMove(gamestate2)
        console.log(i + ":" + move1 + " vs " + move2)
        gamestate.rounds.push({ p1: move1, p2: move2 })
        gamestate.rounds.push({ p1: move2, p2: move1 })
    }
}

//testBots()
/*
{rounds: [
                        {
                            p1 : "R",
                            p2 : "D"
                        },
                        {
                            p1 : "W",
                            p2 : "S"
                        },
                        ...]
                    }
                    */