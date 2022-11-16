let saved = true;
let edit_queue = {};

// URL Format: url/<string:review>/<int:paperNum>
// get the paper number, review
let paperNum = parseInt(window.location.pathname.split('/')[2]);
let review = window.location.pathname.split('/')[1];

/* send post request to /paper/<int:idx>/<string:prop> */
async function edit_prop(idx, prop, value) {
    url = `/${review}/${idx}/${prop}`// '/paper/' + idx + '/' + prop;
    return $.post(url, {value: value});
}

/* add edit to edit queue */
function queue_edit(prop, value) {
    edit_queue[prop] = value;
    saved = false;

    /* set body background color to pink */
    //document.body.style.backgroundColor = '#FFC0CB';
}

/* send all edits in queue */
async function save() {
    /* send all edits in queue and wait for response */
    promises = [];
    for (let prop in edit_queue) {
        promises.push(edit_prop(paperNum, prop, edit_queue[prop]));
    }

    await Promise.all(promises).then(
        () => $.post(`/${review}/save`)
    );

    saved = true;
    /* set body background color to white */
    //document.body.style.backgroundColor = '#FFFFFF';

    return Promise.resolve();
}

function tag_to_text(html) {
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function text_to_tag(text) {
    return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

/* watch all elements with class "editable" -- settimeout to let DOM load */
setTimeout(()=>{
    for (var i = 0; i < document.getElementsByClassName("editable").length; i++) {
        // all elements with class editable should be editable
        document.getElementsByClassName("editable")[i].setAttribute("contenteditable", "true");

        // add event listener to all elements with class editable to allow for tag rendering
        document.getElementsByClassName("editable")[i].addEventListener("focusin", function(e) {
            e.target.innerHTML = tag_to_text(e.target.innerHTML);
        }, false);
        document.getElementsByClassName("editable")[i].addEventListener("focusout", function(e) {
            e.target.innerHTML = text_to_tag(e.target.innerHTML);
        }, false);

        // add event listener to all elements with class editable to allow for saving
        document.getElementsByClassName("editable")[i].addEventListener("input", function(e) {
            new_content = text_to_tag(e.target.innerHTML);
            queue_edit(e.target.dataset.prop, new_content);
        }, false);
    }
}, 0);

function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    else if (e.keyCode == '37') {
        // left arrow
        // check if focus is on body
        if (document.activeElement == document.body) {
            if (!saved) {
                save().then(
                    () => window.location.href = `${paperNum - 1}`
                )
            } else {
                window.location.href = `${paperNum - 1}`;
            }
        }
    }
    else if (e.keyCode == '39') {
        // right arrow
        // check if focus is on body
        if (document.activeElement == document.body) {
            if (!saved) {
                save().then(
                    () => window.location.href = `${paperNum + 1}`
                )
            } else {
                window.location.href = `${paperNum + 1}`;
            }
        }
    }
    /* check for ctrl+s */
    else if (e.keyCode == '83' && e.ctrlKey) {
        save();
    }
}

document.onkeydown = checkKey;