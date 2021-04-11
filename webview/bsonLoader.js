// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

window.addEventListener('load', () => {
    document.getElementById('file-button').addEventListener('click', openPopup);
    document.getElementById('popup-close-button').addEventListener('click', closePopup);
    document.getElementById('popup-submit-button').addEventListener('click', submit);
});

function openPopup() {
    document.getElementById('popup').classList.remove('hidden');
    document.getElementById('backdrop').classList.remove('hidden');
}

function closePopup() {
    document.getElementById('popup').classList.add('hidden');
    document.getElementById('backdrop').classList.add('hidden');
}

function downloadBlob(data, fileName, mimeType) {
    var blob, url;
    blob = new Blob([data], {
        type: mimeType
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function() {
        return window.URL.revokeObjectURL(url);
    }, 1000);
}

function downloadURL(data, fileName) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
}

function submit() {
    let file = document.getElementById('file-input').files[0];
    if (file === undefined || file === null) {
        alert("Please enter a file!");
        return;
    }

    let reader = new FileReader();
    reader.addEventListener('load', readFile);
    reader.readAsArrayBuffer(file);
    closePopup();
}

function readFile(event) {
    let data;

    try {
        data = readAsBSON(event.target.result);
        console.log("Read BSON");
    } catch (error) {
        try {
            data = readAsJSON(event.target.result);
            console.log("Read JSON");
        } catch (error) {
            alert("File not readable as either BSON or JSON object!");
            console.error(error);
            return;
        }
    }

    window.data = data;

    try {
        console.log(data);
        buildView(data);
    } catch (error) {
        alert("Invalid Input!");
        console.error(error);
        openPopup();
    }
}

function readAsBSON(buffer) {
    let uint8result = new Uint8Array(buffer);
    return BSON.deserialize(uint8result);
}

function readAsJSON(buffer) {
    let input = new TextDecoder().decode(buffer);
    return JSON.parse(input);
}

function buildView(data) {
    document.querySelector(".members-content").innerHTML = buildUserGroups(data);
    document.querySelector(".scroller-inner").innerHTML = buildContentView(data);
}

function buildUserGroups(data) {
    console.log("asd");
    let roleUserSort = {};

    Object.values(data['roles']).forEach(role => {
        roleUserSort[role['name']] = [];
    });

    roleUserSort.ONLINE = [];

    Object.values(data['userdata']).forEach(user => {
        // Skip all WebHooks
        if (user['userType'] === 2) return;

        if (user['topRole'] !== undefined) {
            roleUserSort[data['roles'][user['topRole']]['name']].push(user);
        } else {
            roleUserSort["ONLINE"].push(user);
        }
    });

    let html = "";

    Object.keys(roleUserSort).forEach(group => {
        let users = roleUserSort[group];
        html += `<h2 class="members-group member-title"><span>${group} — ${users.length}</span></h2>`;
        for (let user of users) {
            html += buildUserEntry(user);
        }
    });

    return html;
}

const memberListBotTagHTML = `
    <span class="bot-tag">
        <span class="bot-tag-text">BOT</span>
    </span>
`;

function buildUserEntry(user) {
    let color = "";

    if (user['topRole']) {
        color = toColor(Number.parseInt(data['roles'][user['topRole']]['color']));
    } else {
        color = "rgb(255, 255, 255)";
    }

    console.log(color);

    return `
        <div class="member member-container member-clickable" role="listitem" tabindex="-1">
            <div class="member-layout">
                <div class="avatar">
                    <div class="avatar-image-wrapper" role="img" style="width: 32px; height: 32px;">
                        <svg class="avatar-mask avatar-svg" height="32" viewBox="0 0 40 32" width="40">
                            <foreignObject height="32" width="32" x="0" y="0">
                                <img alt=" " style="border-radius: 100%" class="avatar-inner" src="${user['lastAvatar']}">
                            </foreignObject>
                        </svg>
                    </div>
                </div>
                <div class="member-content">
                    <div class="name-and-decorators">
                        <div class="member-name">
                            <span class="member-role-color" style="color: ${color};">${user['lastNickname'] || user['lastUsername']}</span>
                        </div>
                        ${user['userType'] !== 0 ? memberListBotTagHTML : ""}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function buildContentView(data) {
    let html = `
        <div class="content-header-container">
            <h1 class="content-header-title">Willkommen bei #${data['name']}!</h1>
            <div class="size16 content-header-description">Das ist der Beginn des Kanals #${data['name']}: ${data['topic']}</div>
        </div>
    `;

    data['messages'].forEach(message => html += buildMessage(data, message))
    html += `<div class="scroller-spacer"></div>`;

    return html;
}

function buildMessage(data, message) {
    let mediaHTML = ``;
    for (let src of message['attachments']) {
        mediaHTML += `<img alt=" " src="${src}">`;
    }

    let user = data['userdata'][message['author']];

    let color = "";
    if (data['userdata'][message['author']]['topRole']) {
        color = toColor(Number.parseInt(data['roles'][data['userdata'][message['author']]['topRole']]['color']));
    } else {
        color = "rgb(255, 255, 255)";
    }

    return `
        <div class="message" role="listitem" tabindex="-1">
            <div class="contents" role="document">
                <img alt=" " class="message-avatar" src="${user['lastAvatar']}">
                <h2>
                    <span class="header-text">
                        <span style="color: ${color};" tabindex="0">
                            ${user['lastNickname'] || user['lastUsername']}${user['userType'] !== 0 ? memberListBotTagHTML : ""}
                        </span>
                    </span>
                    <span class="message-timestamp">
                        <time datetime="2021-04-10T20:39:34.143Z">
                            <i aria-hidden="true" class="timestamp-separator"> — </i>
                            ${message['id']}
                        </time>
                    </span>
                </h2>
                <div class="message-content">${message['content']}</div>
            </div>
            <div class="media-container">${mediaHTML}</div>
        </div>
    `;
}

function toColor(num) {
    num >>>= 0;
    let b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16;
    return "rgb(" + [r, g, b].join(",") + ")";
}