console.log("=======================================================================");
console.log("||||||||||||||||| WELCOME TO SQUARE REMEMBER GAME |||||||||||||||||||||");
console.log("|||||||||||||||||||||||| CREAATE BY AZUHRI ||||||||||||||||||||||||||||");
console.log("=======================================================================");
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function timer(desc, time) {
    $("#desc").text(desc);
    var countDownDate = new Date().getTime();
    // Update the count down every 1 second
    var x = setInterval(async function() {
        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = (countDownDate + time * 1000) - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("timer").innerHTML = `${minutes < 10 ? "0"+minutes : minutes}:${seconds < 10 ? "0"+seconds : seconds}`;

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "TIMEOUT";
        }
    }, 1000);
}


let dataGames = {
    level: 1,
    time: {
        prepare: 10,
        timeout: 5,
    },
    total_square: 1
};

let dataUser = {
    name: null,
    started_at: null,
    ended_at: null,
}

let squareNum = [];
let squareNumAnswer = [];
let countOfSelectSquare = 0;
let statusGame = true;

const infoLevel = () => {
    console.log(`Level: ${dataGames.level}`);
    console.log(`Time Prepare: ${dataGames.time.prepare}`);
    console.log(`Deadtime : ${dataGames.time.timeout}`);
    console.log(`Total Remember Squares : ${dataGames.total_square}`);
}

const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

const validRandomNumber = (num) => {
    if(squareNum.length > 0) {
        squareNum.forEach(val => {
            if(val == num) {
                return false;
            }
            return true;
        });
    }
    return true;
}

const playAgain = () => {
    Swal.fire({
        title: 'Message',
        text: "Do u wanna play again ?",
        icon: 'info',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
    }).then(val => {
        if(val.isConfirmed) {
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    });
}

const correctAnswer = () => {
    for (let i = 0; i < squareNum.length; i++) {
        $(`#square${squareNum[i]}`).removeClass("bg-warning");
        $(`#square${squareNum[i]}`).removeClass("bg-transparent");
        $(`#square${squareNum[i]}`).addClass("bg-danger");
    }
}

const selectSquare = (self) => {
    let idSquare = $(self).attr("id");
    idSquare = parseInt(idSquare.replace("square",""));
    let statusSquare = $(self).attr("data-button");
    if(statusSquare == "unselect") {
        if(!statusGame || countOfSelectSquare < 1) {
            return;
        }
        $(self).removeClass("bg-warning");
        $(self).addClass("bg-transparent");
        $(self).attr("data-button", "selected");
        squareNumAnswer.push(idSquare);
        countOfSelectSquare--;
    } else {
        squareNumAnswer = squareNumAnswer.filter(id => id !== idSquare);
        $(self).removeClass("bg-transparent");
        $(self).addClass("bg-warning");
        $(self).attr("data-button", "unselect");
        countOfSelectSquare++;
    }
}

const checkAnswer = (arr1, arr2) => {
    arr1.sort();
    arr2.sort();
    if(arr1.length != arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if(arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

const assignSquareValid = () => {
    for (let i = 0; i < squareNum.length; i++) {
        $(`#square${squareNum[i]}`).removeClass("bg-warning");
        $(`#square${squareNum[i]}`).addClass('bg-success');
    }
}

let templateBackgroundSquare = (bgColor, squareRemember = 0) => {
    if(squareRemember > 0) {
        squareNum = [];
    }
    squareNumAnswer = [];
    $("#containerSquare").html("");
    let element = '';
    let counters = 0;
    let counterSquareRemember = squareRemember;
    countOfSelectSquare = squareRemember != 0 ? squareRemember : countOfSelectSquare;
    for (let i = 0; i < 11; i++) {
        for (let x = 0; x < 10; x++) {
            let randomNum = randomNumber(0, 109);
            if(validRandomNumber(randomNum) && counterSquareRemember != 0) {
                squareNum.push(randomNum);
                counterSquareRemember--;
            }
            element += `<div class="size-square border-square ${bgColor} cursor-pointer" id="square${counters}"  ${squareRemember == 0 ? 'onclick="selectSquare(this);"' : ""} data-button='unselect'>&nbsp;</div>`
            counters++;
        }
    }
    return element;
}


const playGame = async () => {
    let result = false;
    await Swal.fire({
        title: `<strong>LEVEL ${dataGames.level}</strong>`,
        icon: 'info',
        html:
          `<p>Total Remember Square : ${dataGames.total_square}</p>` +
          `<p>Time To Remember Square : ${dataGames.time.prepare} Seconds</p>` +
          `<p>Timeout : ${dataGames.time.timeout} Seconds</p>`,
        showCancelButton: false,
        confirmButtonText: 'CLICK TO START',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(async val => {
          if(val.isConfirmed) {
            infoLevel();

            // PREPARE GAME
            timer('(PREPARE TIME)', dataGames.time.prepare);
            $("#containerSquare").append(templateBackgroundSquare("bg-warning", dataGames.total_square));
            assignSquareValid();
            await delay(dataGames.time.prepare * 1000);
            
            // ANSWERING GAME
            timer('(ANSWERING TIME)', dataGames.time.timeout);
            $("#containerSquare").append(templateBackgroundSquare("bg-warning"));
            await delay(dataGames.time.timeout * 1000);
            
            // CHECK ANSWER
            result = checkAnswer(squareNum, squareNumAnswer);
            timer('(CHECKING TIME)', 3);
            delay(3000);

            if(result) {
                 Swal.fire({
                    title: 'Message',
                    text: "Congratulations.. your answer is right!",
                    icon: 'success',
                    showCancelButton: false,
                    showConfirmButton: false,
                    confirmButtonColor: '#3085d6',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 3000,
                })
            } else {
                Swal.fire({
                    title: 'Message',
                    text: "Don't be sad.. you will win soon!",
                    icon: 'error',
                    showCancelButton: false,
                    showConfirmButton: false,
                    confirmButtonColor: '#3085d6',
                    timer: 3000,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                })
                return false;
            }
            $("#level").text(dataGames.level+1);
            dataGames.level++
            dataGames.time.timeout += 2
            dataGames.total_square++;
            return true;
          }
      })
      return result;
}
const nextLevel = async () => {
    while(statusGame) {
        statusGame = await playGame();
        await delay(2000);
    }
    correctAnswer();
    await delay(2000);
    playAgain();
}

const unknownGuest = () => {
    
}

const newPlayer = () => {

}

const existingPlayer = () => {
    
}

const infoPlayer = () => {
    $("#modalPlayAs").modal("show");
}

let configGame = async () => {
    Swal.fire({
            title: 'DO YOU WANNA PLAY ?',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: "CLICK TO PLAY GAME",
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false
    }).then(val => {
        if(val.isConfirmed) {
            nextLevel();
            // infoPlayer();
            
        }
    })
}

configGame();
