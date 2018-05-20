/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(1);
const play = __webpack_require__(2);

// Check the arguments
if (process.argv.length !== 4) {
    console.log('Specify 2 arguments with the file path to the bots:');
    console.log('\n\tnode dynamite-cli.js myBot1.js myBot2.js\n');
    process.exit(1);
}

// Options for the game
const options = {roundLimit: 2500, scoreToWin: 1000, dynamite: 100};
const botPath1 = process.argv[2];
const botPath2 = process.argv[3];

// Load a bot using eval
function loadBot(path) {
    const botContent = fs.readFileSync(path, 'utf-8');
    const module = {};
    eval(botContent);
    return module.exports;
}

const bot1 = loadBot(botPath1);
const bot2 = loadBot(botPath2);

// Dummy runner client that directly references the loaded bots using IDs 1 and 2
class CliRunnerClient {
    createInstance(botId) {
        return Promise.resolve({instanceId: botId});
    }

    makeMove(instanceId, gamestate) {
        switch(instanceId) {
            case 1: return Promise.resolve({move: bot1.makeMove(gamestate)});
            case 2: return Promise.resolve({move: bot2.makeMove(gamestate)});
            default: return Promise.reject('No such bot');
        }
    }

    deleteInstance(instanceId) {
        return Promise.resolve();
    }
}

const cliRunnerClient = new CliRunnerClient();

play(1, 2, cliRunnerClient, options)
    .then(output => {
        console.log('Winner: Player ' + output.winner);
        console.log('Reason: ' + output.reason);
        console.log('Score: ' + output.score[1] + ' - ' + output.score[2]);
    })
    .catch((err) => console.error('Unexpected Error:\n', err));


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(3);

function play (botId1, botId2, runnerClient, options) {
    return Promise.all([runnerClient.createInstance(botId1), runnerClient.createInstance(botId2)])
        .then(botIdObjs => new Game(botIdObjs.map(obj => obj.instanceId), runnerClient, options))
        .then(game =>
            game.play().then(output =>
                game.deleteBots()
                    .then(() => output)
            ));
}

module.exports = play;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// N.B. Avoid importing modules here where possible,
// these will be included in the bundled dynamite-cli.js
const DynamiteError = __webpack_require__(4);

class Game {

    constructor (botIds, runnerClient, options) {
        this.botIds = {1: botIds[0], 2: botIds[1]};
        this.score = {1: 0, 2: 0};
        this.dynamite = {1: options.dynamite, 2: options.dynamite};
        this.gamestate = {1:{rounds:[]}, 2:{rounds:[]}};

        this.scoreToWin = options.scoreToWin;
        this.roundLimit = options.roundLimit;
        this.runnerClient = runnerClient;
        this.nextRoundPoints = 1;
    }

    updateDynamite(moves) {
        for (let i = 1; i <= 2; i++) {
            if (moves[i] === 'D') {
                this.dynamite[i] -= 1;
            }
            if (this.dynamite[i] < 0) {
                throw new DynamiteError('', i);
            }
        }
    }

    updateGamestate(moves) {
        this.gamestate[1].rounds.push({p1: moves[1], p2: moves[2]});
        this.gamestate[2].rounds.push({p1: moves[2], p2: moves[1]});
    }

    updateScore(moves) {
        if (moves[1] === moves[2]) {
            this.nextRoundPoints += 1;
            return;
        }
        if (
            (moves[1] === 'D' && moves[2] !== 'W') ||
            (moves[1] === 'W' && moves[2] === 'D') ||
            (moves[1] === 'R' && moves[2] === 'S') ||
            (moves[1] === 'S' && moves[2] === 'P') ||
            (moves[1] === 'P' && moves[2] === 'R') ||
            (moves[1] !== 'D' && moves[2] === 'W')
        ) {
            this.score[1] += this.nextRoundPoints;
        } else {
            this.score[2] += this.nextRoundPoints;
        }
        this.nextRoundPoints = 1;

    }

    getOutput(winner, reason, err) {
        const output = {
            winner: winner,
            reason: reason,
            score: this.score,
            gamestate: this.gamestate[1]
        };
        if (err) {
            output.error = err;
        }
        return output;
    }

    play () {
        if (this.scoreToWin <= Math.max(this.score[1], this.score[2])) {
            return this.getOutput(this.score[1] > this.score[2] ? 1 : 2, 'score');
        }
        if (this.gamestate[1].rounds.length >= this.roundLimit) {
            return this.getOutput(this.score[1] > this.score[2] ? 1 : 2, 'round limit');
        }
        return Promise.all([
            this.runnerClient.makeMove(this.botIds[1], this.gamestate[1]).catch(err => {err.error.player = 1; throw err.error;}),
            this.runnerClient.makeMove(this.botIds[2], this.gamestate[2]).catch(err => {err.error.player = 2; throw err.error;})
        ])
            .then(res => {
                const moves = {1: res[0].move, 2: res[1].move};
                this.updateGamestate(moves);
                this.updateDynamite(moves);
                this.updateScore(moves);
            })
            .then(() => this.play())
            .catch(err => {
                if ('player' in err) {
                    // return the number of the winning player
                    return this.getOutput(3 - err.player, 'error', err);
                } else {
                    throw err;
                }
            });
    }

    deleteBots() {
        return Promise.all([
            this.runnerClient.deleteInstance(this.botIds[1]),
            this.runnerClient.deleteInstance(this.botIds[2])
        ]);
    }

}

module.exports = Game;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

class GameError extends Error {
    constructor(message, player) {
        super(message);
        this.player = player;
        Error.captureStackTrace(this);
        this.name = this.constructor.name;
    }
}

module.exports = GameError;


/***/ })
/******/ ]);