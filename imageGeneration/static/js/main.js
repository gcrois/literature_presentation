SD_BACKEND = 'http://gregtc.eecs.umich.edu:9090';

prompts = {};

function post(data, callback, url="/", fail=console.error) {
    console.log(data);
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: callback,
        error: fail,
    });
}

function onload() {
    console.log("js loaded")
}

/* https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript */
String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function addPrompt(prompt=$('#prompt').val()) {
    hash = prompt.hashCode();

    if (hash in prompts) {
        console.log("prompt already exists");

        // set prompt field to warning
        $('#prompt').addClass("is-invalid");
        return;
    } else if (prompt == "") {
        console.log("prompt is empty");

        // set prompt field to warning
        $('#prompt').addClass("is-invalid");
        return;
    } else {
        prompts[prompt.hashCode()] = prompt;
        // add prompt to ul #prompts-list
        $("#prompts-list").append(`<li class='list-group-item'>${prompt}</li>`);

        // remove warning from prompt field
        $('#prompt').removeClass("is-invalid");

        // clear prompt field
        $('#prompt').val("");
        return;
    }
}

function getPrompts() {
    // return all prompts separated by |
    return Object.values(prompts).join("|");
}

async function generateImage(prompt=getPrompts(), steps=5) {
    // gray out generate-image
    $("#generate-image").prop("disabled", true);
    $("#generate-image").text("Generating...");

    await fetch("http://gregtc.eecs.umich.edu:9090/sdapi/v1/txt2img", {
    "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:108.0) Gecko/20100101 Firefox/108.0",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json"
    },
    "body": `{"prompt": "${prompt}","steps": ${steps}}`,
    "method": "POST",
    "mode": "cors"
    }).then(response => response.json()).then(data => {
        console.log(data);
        image = data['images'][0]
        insertImage(image);

        // ungray generate-image
        $("#generate-image").prop("disabled", false);
        $("#generate-image").text("Generate Image");
    });
}

function insertImage(base64) {
    // add bootstrap card to #image-cards
    // $("#generated-image").attr("src", `data:image/png;base64,${base64}`);
    $("#image-cards").append(`
        <div class="card" style="width: 18rem;">
            <img src="data:image/png;base64,${base64}" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">${getPrompts()}</p>
            </div>
        </div>
    `);
}


/*$(document).keydown(function(e) {
    $("#kp_view").text(`'${e.key}'`);

    post(
        {key: e.key},
        (data) => {$("#r_view").text(data);},
        "/keypress",
    );
});*/

document.onload = onload;