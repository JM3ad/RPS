class Bot {

    constructor() {
        this.dynamitesUsed = 0;
        this.tiesSoFar = 0;
        this.opponentsDynamite=0;
    }

    makeMove(gamestate) {
        var moves = ['S', 'R', 'P', 'D', 'W'];
        var move = moves[Math.floor(Math.random() * 3)];

        this.updateDynamiteCount(gamestate.rounds);

        if (this.isADraw(gamestate.rounds)) {
            this.tiesSoFar++;
        } else {
            this.tiesSoFar = 0;
        }

        if (this.dynamitesUsed < 100 && this.tiesSoFar > 1) {
            move = this.getDrawMove(moves, gamestate.rounds)
        }

        if (move === 'D') {
            this.dynamitesUsed++;
        }
        return move;
    }

    countDynamites(rounds){
        if (rounds.length<3){
            return 0;
        }
        var count =0;
        for(var i=0;i<rounds.length;i++){
            if(rounds[rounds.length-i-1].p2==='D'){
                count++;
            }
            else{
                break;
            }
        }
        return count;
    }

    updateDynamiteCount(rounds){
        var lastRoundIndex = rounds.length - 1;
        if (lastRoundIndex === -1) {
            return
        }
        var p2move = rounds[lastRoundIndex].p2
        if(p2move==='D'){
            this.opponentsDynamite++;
        }
    }

    getDrawMove(moves, rounds) {
        var move = Math.floor(Math.random() * 2 + this.tiesSoFar/6 + this.countDynamites(rounds)/5);
        if (move === 0) {
            return moves[Math.floor(Math.random() * 3)];
        }
        if (move>2.7  && this.opponentsDynamite<100){
            return 'W';
        }
        return 'D';
    }

    isADraw(rounds) {

        var lastRoundIndex = rounds.length - 1;
        if (lastRoundIndex === -1) {
            return false
        }
        var p1move = rounds[lastRoundIndex].p1
        var p2move = rounds[lastRoundIndex].p2
        return p1move === p2move
    }
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