// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let catCount = 6;
let qaCount = 5;



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {

    let pickId = new Set();

    while (pickId.size < catCount) {
        const response = await axios.get("http://jservice.io/api/random?count=100");

        let allCatId = response.data.map(result => {
            return result.category.id
        });

        allCatId.forEach(item => pickId.add(item));
    }

    return [...pickId].slice(0, catCount);

}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get(`http://jservice.io/api/clues?category=${catId}`);
    let clueArray = response.data.map(result => {
        return { "question": result.question, 'answer': result.answer, showing: null };
    })

    //shuffle the array
    clueArray.sort(() => Math.random() - 0.5);

    const newClueArr = clueArray.slice(0, qaCount);

    const retObj = {};

    retObj.title = response.data[0].category.title;
    retObj.clues = newClueArr;

    return retObj;

}



/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const $body = $("body");
    $body.prepend("<table class='table'><thead><tr class='table-primary'></tr></thead><tbody></tbody></table>");
    const $headTr = $("thead tr");
    const $tbody = $("tbody");


    for (let category of categories) {
        let $item = $(
            `
                    <th class="gridStyleTh" scope="row">${category.title}</th>
                    `
        )
        $headTr.append($item);
    }

    for (let i = 0; i < qaCount; i++) {
        $tbody.append(`<tr row=${i}></tr>`);

        for (let j = 0; j < catCount; j++) {
            $("tbody tr").eq(i).append(`<td class="gridStyleTd" id="${j}-${i}"">&quest;</td>`);
        }
    }

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let getId = evt.target.id;
    let x = getId.split("")[0];
    let y = getId.split("")[getId.length - 1];
    const id = document.getElementById(getId);

    if (categories[x].clues[y].showing == null) {
        id.innerText = categories[x].clues[y].question;
        categories[x].clues[y].showing = "question";
    }

    else if (categories[x].clues[y].showing == "question") {
        id.innerText = categories[x].clues[y].answer;
        categories[x].clues[y].showing = "answer";
    }
    else {
        return;
    }

}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("body").append("<div class='loader'></div><div id='loading'>Loading...</div>");

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $(".loader").remove();
    $("#loading").remove();

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {

    showLoadingView();
    $(".btn").hide();

    let randomCatIds = await getCategoryIds();

    for (let i = 0; i < randomCatIds.length; i++) {
        categories.push(await getCategory(randomCatIds[i]));
    }


    fillTable();

    document.querySelectorAll(".gridStyleTd").forEach(
        e => e.addEventListener("click", handleClick)
    );

    hideLoadingView();
    $(".btn").show();
}

/** On click of start / restart button, set up game. */

// TODO
function resetGame() {
    categories = [];
    $(".table").remove();
    setupAndStart();

}



/** On page load, add event handler for clicking clues */

// TODO
window.onload = async function () {
    await setupAndStart();

    $("<button type='button' class='btn btn-secondary'>Restart Game</button>").appendTo("body");
    const resetBtn = document.querySelector(".btn");
    resetBtn.addEventListener("click", resetGame);

}
