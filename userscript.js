// ==UserScript==
// @name         CardRecordPROMAX-Lite
// @namespace    http://tampermonkey.net/
// @description  CardRecordPROMAX Lite
// @author       Several People
// @match        *://ruarua.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    document.body.style.userSelect = "auto";
    if (document.cookie.match("nohorizon") === null) {
        document.cookie = "nohorizon=1; path=/; domain=ruarua.ru; expires=Mon, 01 Jan 2123 00:00:00 GMT";
    }

    const pair = new Array(1005).fill("")
        pair[1] = "exp"; pair[2] = "coin"; pair[3] = "leaf"; pair[4] = "gold"; pair[5] = "void";
        pair[6] = "crystal"; pair[7] = "arrow"; pair[8] = "spike"; pair[9] = "egg"; pair[10] = "bomb";
        pair[11] = "mojo"; pair[12] = "ducat"; pair[13] = "crucifix"; pair[14] = "yinyang"; pair[15] = "dart";
        pair[16] = "lightning"; pair[17] = "heart"; pair[18] = "ticket"; pair[19] = "key"; pair[20] = "eye";
        pair[21] = "clover"; pair[22] = "rock"; pair[23] = "paw"; pair[24] = "sulfur"; pair[25] = "luna";
        pair[26] = "kinoko"; pair[27] = "flower"; pair[28] = "roe"; pair[29] = "rice"; pair[30] = "scute";
        pair[31] = "vitae"; pair[32] = "pearl"; pair[33] = "dice"; pair[34] = "atom"; pair[35] = "kite";
        pair[36] = "medal"; pair[37] = "drop"; pair[38] = "cherry"; pair[39] = "lotus"; pair[40] = "wafer";
        pair[41] = "flame"; pair[42] = "pill"; pair[43] = "apple"; pair[44] = "dash"; pair[45] = "celtic";
        pair[46] = "1UP"; pair[47] = "lazuli"; pair[48] = "coffee"; pair[1001] = "cube";


    let isShiftPressed = false;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Shift') {
            isShiftPressed = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            isShiftPressed = false;
        }
    });

    function cardToID(card) {
        card = card.toLowerCase()
        for (let i = 1; i < pair.length; i++) {
            if (pair[i] === card) {
                return i
            }
        }
        return -1
    }
    function IDToCard(id) {
        if (id < 1 || id > pair.length) {
            return ""
        }
        if (pair[id] === "") {
            return ""
        }
        const card = pair[id]
        return card.charAt(0).toUpperCase() + card.slice(1).toLowerCase()
    }

    function chatScroll() {
        if (document.getElementById("board").scrollTop !== document.getElementById("board").scrollHeight) {
            document.getElementById("board").scrollTop = document.getElementById("board").scrollHeight
        }
    }

    function log(message, type = 'info') {
        const colors = {
            info: '#ffa090',
            success: '#7eef6d',
            error: '#7f0000',
            warning: '#ffff00',
            debug: '#80c0ff'
        }

        const color = colors[type] || colors.info
        const board = document.getElementById("board")

        if (board) {
            board.innerHTML += `<div><span style="color: #7eef6d">[SCRIPT] </span><span style="color: ${color}">${message}</span></div>`
            chatScroll()
        } else {
            console.log(`[SCRIPT] ${message}`)
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function getRandomDelay(minSeconds, maxSeconds) {
        return (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000;
    }

    const oldCraft = unsafeWindow.craftcard
    const oldFrag = unsafeWindow.craftfrag
    let prevCraftState = false, curCraftState = false
    let prevFragState = false, curFragState = false

    async function injectCraft() {
        unsafeWindow.craftcard = function () {
            if (isShiftPressed) unsafeWindow.singleall()
            setTimeout(oldCraft(), 100)
        }
        for (const element of document.getElementsByName("cardchoose")) {
            element.addEventListener('change', function () {
                if (isShiftPressed && element.checked) unsafeWindow.singleall()
            })
        }
    }
    async function injectFrag() {
        unsafeWindow.craftfrag = function () {
            if (isShiftPressed) unsafeWindow.singleall2()
            setTimeout(oldFrag(), 100)
        }
        for (const element of document.getElementsByName("cardchoose")) {
            element.addEventListener('change', function () {
                if (isShiftPressed && element.checked) unsafeWindow.singleall2()
            })
        }
    }

    setInterval(function () {
        prevCraftState = curCraftState
        curCraftState = unsafeWindow.location.pathname.startsWith("/e/craftcard")
        if (curCraftState && !prevCraftState) injectCraft()
    }, 1400)
    setInterval(function () {
        prevFragState = curFragState
        curFragState = unsafeWindow.location.pathname.startsWith("/e/frag")
        if (curFragState && !prevFragState) injectFrag()
    }, 1400)

    let goCraft = false
    function craftRule(value) {
        if (/^\d+\.\d+\b/.test(value) === false) {
            return false
        }
        const craftMin = 1
        const craftMax = 4
        let testID = parseInt(value.match(/^\d+/)[0], 10), testRarity = parseInt(value.match(/(?<=\.)\d+/)[0], 10)

        if (testRarity < 1 || testRarity > 7) return false
        if (testID < 1 || testID > 100) return false
        let expectedMode = true
        if (testRarity > 4) {
            expectedMode = false
        }
        if (IDToCard(testID) == "Dice") {
            expectedMode = false
        }
        if (IDToCard(testID) == "Flame" && testRarity > 3) {
            expectedMode = false
        }
        if (IDToCard(testID) == "Kite" && testRarity > 3) {
            expectedMode = false
        }
        if (IDToCard(testID) == "Atom" && testRarity < 3) {
            expectedMode = false
        }
        const craftMode = expectedMode
        if (testRarity < craftMin || testRarity > craftMax) {
            return false
        }
        return craftMode
    }
    async function allCraft() {
        if (unsafeWindow.location.pathname.startsWith("/e/craftcard") === false && unsafeWindow.location.pathname.startsWith("/craftcard") === false) {
            log("Error: Not crafting!", "error")
            return
        }
        log("Crafting...", "info")
        goCraft = true
        let canCraft = true
        while (goCraft && canCraft) {
            canCraft = false
            for (let i = document.getElementsByName("cardchoose").length - 1; i >= 0; i--) {
                if (canCraft == false && goCraft && craftRule(document.getElementsByName("cardchoose")[i].value) && parseInt(document.getElementsByName("cardchoose")[i].labels[0].innerText.match(/\d+/)[0], 10) >= 5) {
                    let pendingRarity = parseInt(document.getElementsByName("cardchoose")[i].value.match(/(?<=\.)\d+/)[0], 10)
                    document.getElementsByName("cardchoose")[i].checked = 1
                    await delay(getRandomDelay(0.2, 0.4))
                    document.getElementById("nownum").innerHTML = parseInt(document.getElementsByName("cardchoose")[i].labels[0].innerText.match(/\d+/)[0], 10)
                    unsafeWindow.craftchange()
                    await delay(getRandomDelay(0.2, 0.6))
                    oldCraft()
                    while (document.getElementsByName("cardchoose").length > i && document.getElementsByName("cardchoose")[i].checked) {
                        await delay(getRandomDelay(0.1, 0.5))
                    }
                    await delay(getRandomDelay(0.5, 1.1))
                    canCraft = true
                }
            }
        }
        log("Craft ended", "success")
    }
    async function singleCraft(value) {
        if (unsafeWindow.location.pathname.startsWith("/e/craftcard") === false && unsafeWindow.location.pathname.startsWith("/craftcard") === false) {
            log("Error: Not crafting!", "error")
            return
        }
        log("Crafting single card...", "info")
        for (let i = document.getElementsByName("cardchoose").length - 1; i >= 0; i--) {
            if (document.getElementsByName("cardchoose")[i].value === value && parseInt(document.getElementsByName("cardchoose")[i].labels[0].innerText.match(/\d+/)[0], 10) >= 5) {
                let pendingRarity = parseInt(document.getElementsByName("cardchoose")[i].value.match(/(?<=\.)\d+/)[0], 10)
                document.getElementsByName("cardchoose")[i].checked = 1
                await delay(200)
                document.getElementById("nownum").innerHTML = parseInt(document.getElementsByName("cardchoose")[i].labels[0].innerText.match(/\d+/)[0], 10)
                unsafeWindow.craftchange()
                await delay(200)
                oldCraft()
                while (document.getElementsByName("cardchoose").length > i && document.getElementsByName("cardchoose")[i].checked) {
                    await delay(100)
                }
                await delay(500)
            }
        }
        log("Craft ended", "success")
    }


    const oldSend = unsafeWindow.send
    unsafeWindow.send = function () {
        const messageValue = document.getElementById("message").value
        let newMessageValue = messageValue

        if (newMessageValue === ".craft") {
            allCraft()
            newMessageValue = ""
            document.getElementById("message").value = newMessageValue
        }
        else {
            document.getElementById("message").value = newMessageValue
        }
        oldSend()
    }

})();
