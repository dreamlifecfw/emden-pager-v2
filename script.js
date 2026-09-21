"use strict";

/* =========================================================
   EMDEN PAGER
   الجوال + PS5
   الإرسال والحفظ عبر Supabase Database
   ========================================================= */


/* =========================================================
   العناصر
   ========================================================= */

var warning = document.getElementById("warning");
var agreeBtn = document.getElementById("agreeBtn");
var timerEl = document.getElementById("timer");

var modal = document.getElementById("modal");
var modalTitle = document.getElementById("modalTitle");

var codeStep = document.getElementById("codeStep");
var sendStep = document.getElementById("sendStep");
var decodeStep = document.getElementById("decodeStep");

var codeDisplay = document.getElementById("codeDisplay");
var keypad = document.getElementById("keypad");

var enteredCode = "";
var mode = "";

var cooldownRunning = false;


/* =========================================================
   الأكواد
   ========================================================= */

var NORMAL_SEND_CODE = "1889";
var NORMAL_DECODE_CODE = "1900";

var PS5_CODE = "5576";
var PS5_DECODE_CODE = "5567";


/* =========================================================
   SUPABASE
   ========================================================= */

var SUPABASE_URL =
    "https://hmwnhwfjffkxmufripok.supabase.co";

var SUPABASE_KEY =
    "sb_publishable_YdLIkiNahtrG0AFSX7iVVA__nYrwICs";

var supabaseClient = null;

var realtimeChannel = null;

var supabaseReady = false;


/* =========================================================
   تشغيل Supabase
   ========================================================= */

try {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        supabaseReady = true;

        console.log(
            "Supabase: جاهز"
        );

    } else {

        console.log(
            "Supabase غير متاح"
        );

    }

} catch (error) {

    console.log(
        "Supabase Error:",
        error
    );

}


/* =========================================================
   إخفاء رموز الدخول
   ========================================================= */

var actionSmall =
    document.querySelectorAll(
        ".actions small"
    );

for (
    var a = 0;
    a < actionSmall.length;
    a++
) {

    actionSmall[a].textContent =
        "رمز الدخول: ••••";

}


/* =========================================================
   عداد الموافقة
   ========================================================= */

var seconds = 5;

var countdown =
    setInterval(
        function () {

            seconds--;

            if (seconds <= 0) {

                clearInterval(
                    countdown
                );

                agreeBtn.disabled = false;

                agreeBtn.style.pointerEvents =
                    "auto";

                agreeBtn.style.opacity =
                    "1";

                timerEl.textContent =
                    "";

            } else {

                timerEl.textContent =
                    seconds;

            }

        },
        1000
    );


/* =========================================================
   موافق
   ========================================================= */

agreeBtn.addEventListener(
    "click",
    function () {

        warning.classList.add(
            "hidden"
        );

        document
            .getElementById("app")
            .classList.remove(
                "hidden"
            );

        loadMessages();

        startRealtime();

    }
);


/* =========================================================
   فتح النافذة
   ========================================================= */

function openModal(type) {

    mode = type;

    enteredCode = "";

    codeDisplay.textContent = "";

    codeStep.classList.remove(
        "hidden"
    );

    sendStep.classList.add(
        "hidden"
    );

    decodeStep.classList.add(
        "hidden"
    );


    if (type === "send") {

        modalTitle.textContent =
            "إرسال رسالة";

    }

    else if (type === "decode") {

        modalTitle.textContent =
            "فك الشفرة";

    }

    else if (type === "ps5") {

        modalTitle.textContent =
            "🎮 نظام PS5";

    }

    else if (type === "ps5Decode") {

        modalTitle.textContent =
            "🎮 فك شفرة PS5";

    }


    modal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   زر الإرسال العادي
   ========================================================= */

var sendOpen =
    document.getElementById(
        "sendOpen"
    );

if (sendOpen) {

    sendOpen.addEventListener(
        "click",
        function () {

            openModal("send");

        }
    );

}


/* =========================================================
   زر فك الشفرة العادي
   ========================================================= */

var decodeOpen =
    document.getElementById(
        "decodeOpen"
    );

if (decodeOpen) {

    decodeOpen.addEventListener(
        "click",
        function () {

            openModal("decode");

        }
    );

}


/* =========================================================
   زر PS5
   ========================================================= */

var ps5Open =
    document.getElementById(
        "ps5Open"
    );

if (ps5Open) {

    ps5Open.addEventListener(
        "click",
        function () {

            openModal("ps5");

        }
    );

}


/* =========================================================
   إغلاق النافذة
   ========================================================= */

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        function () {

            modal.classList.add(
                "hidden"
            );

        }
    );


/* =========================================================
   لوحة الأرقام
   ========================================================= */

function createKey(number) {

    var button =
        document.createElement(
            "button"
        );

    button.type = "button";

    button.textContent =
        number;

    button.addEventListener(
        "click",
        function () {

            if (
                enteredCode.length >= 4
            ) {

                return;

            }

            enteredCode +=
                String(number);

            codeDisplay.textContent =
                "•".repeat(
                    enteredCode.length
                );


            if (
                enteredCode.length === 4
            ) {

                checkCode();

            }

        }
    );

    keypad.appendChild(
        button
    );

}


/* =========================================================
   إنشاء لوحة الأرقام
   ========================================================= */

for (
    var k = 1;
    k <= 9;
    k++
) {

    createKey(k);

}

createKey(0);


/* =========================================================
   مسح الرمز
   ========================================================= */

document
    .getElementById("clearCode")
    .addEventListener(
        "click",
        function () {

            enteredCode = "";

            codeDisplay.textContent =
                "";

        }
    );


/* =========================================================
   التحقق من الرمز
   ========================================================= */

function checkCode() {

    var correctCode = "";


    if (mode === "send") {

        correctCode =
            NORMAL_SEND_CODE;

    }

    else if (mode === "decode") {

        correctCode =
            NORMAL_DECODE_CODE;

    }

    else if (mode === "ps5") {

        correctCode =
            PS5_CODE;

    }

    else if (mode === "ps5Decode") {

        correctCode =
            PS5_DECODE_CODE;

    }


    if (
        enteredCode !== correctCode
    ) {

        alert(
            "الرمز غير صحيح"
        );

        enteredCode = "";

        codeDisplay.textContent =
            "";

        return;

    }


    codeStep.classList.add(
        "hidden"
    );


    /* إرسال عادي */

    if (mode === "send") {

        sendStep.classList.remove(
            "hidden"
        );

    }


    /* فك عادي */

    else if (mode === "decode") {

        decodeStep.classList.remove(
            "hidden"
        );

    }


    /* PS5 */

    else if (mode === "ps5") {

        sendPS5Step();

    }


    /* فك PS5 */

    else if (mode === "ps5Decode") {

        decodeStep.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   فتح إرسال PS5 بدون كود إرسال إضافي
   ========================================================= */

function sendPS5Step() {

    var input =
        document.getElementById(
            "messageInput"
        );

    if (input) {

        input.value = "";

    }

    sendStep.classList.remove(
        "hidden"
    );

    modalTitle.textContent =
        "🎮 إرسال رسالة PS5";

}


/* =========================================================
   الترميز
   ========================================================= */

var alphabet = {

    "ا": "01",
    "ب": "02",
    "ت": "03",
    "ث": "04",
    "ج": "05",
    "ح": "06",
    "خ": "07",
    "د": "08",
    "ذ": "09",
    "ر": "10",
    "ز": "11",
    "س": "12",
    "ش": "13",
    "ص": "14",
    "ض": "15",
    "ط": "16",
    "ظ": "17",
    "ع": "18",
    "غ": "19",
    "ف": "20",
    "ق": "21",
    "ك": "22",
    "ل": "23",
    "م": "24",
    "ن": "25",
    "ه": "26",
    "و": "27",
    "ي": "28",
    "ء": "29",
    "ى": "30",
    "ة": "31",
    "ئ": "32",
    "ؤ": "33",
    " ": "00"

};


var reverseAlphabet = {};

Object.keys(alphabet).forEach(
    function (letter) {

        reverseAlphabet[
            alphabet[letter]
        ] = letter;

    }
);


/* =========================================================
   عربي → أرقام
   ========================================================= */

function encodeMessage(text) {

    var result = "";

    for (
        var i = 0;
        i < text.length;
        i++
    ) {

        var character =
            text.charAt(i);

        if (
            alphabet[character]
        ) {

            result +=
                alphabet[character];

        }

        else {

            result +=
                "??";

        }

    }

    return result;

}


/* =========================================================
   أرقام → عربي
   ========================================================= */

function decodeMessage(numbers) {

    var cleanNumbers =
        numbers.replace(
            /\s/g,
            ""
        );


    if (!cleanNumbers) {

        return "أدخل أرقام أولاً.";

    }


    if (
        !/^\d+$/.test(
            cleanNumbers
        )
    ) {

        return "أدخل أرقام فقط.";

    }


    if (
        cleanNumbers.length % 2 !== 0
    ) {

        return "الشفرة غير مكتملة.";

    }


    var result = "";


    for (
        var i = 0;
        i < cleanNumbers.length;
        i += 2
    ) {

        var pair =
            cleanNumbers.substring(
                i,
                i + 2
            );


        if (
            reverseAlphabet[pair]
        ) {

            result +=
                reverseAlphabet[pair];

        }

        else {

            result +=
                "؟";

        }

    }


    return result;

}


/* =========================================================
   تحميل الرسائل الموجودة في Supabase
   ========================================================= */

async function loadMessages() {

    if (!supabaseReady) {

        console.log(
            "Supabase غير جاهز"
        );

        return;

    }


    try {

        var result =
            await supabaseClient
                .from("messages")
                .select(
                    "id, encoded_text, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(50);


        if (result.error) {

            console.log(
                "خطأ تحميل الرسائل:",
                result.error
            );

            return;

        }


        var rows =
            result.data || [];


        clearMessages();


        for (
            var i = rows.length - 1;
            i >= 0;
            i--
        ) {

            if (
                rows[i] &&
                rows[i].encoded_text
            ) {

                addMessageToPager(
                    rows[i].encoded_text,
                    false
                );

            }

        }


        console.log(
            "تم تحميل الرسائل:",
            rows.length
        );

    }

    catch (error) {

        console.log(
            "Load messages error:",
            error
        );

    }

}


/* =========================================================
   تنظيف الرسائل قبل إعادة تحميلها
   ========================================================= */

function clearMessages() {

    var messages =
        document.getElementById(
            "messages"
        );

    if (!messages) {

        return;

    }


    messages.innerHTML = "";


    var empty =
        document.createElement(
            "div"
        );

    empty.className =
        "empty";

    empty.textContent =
        "لا توجد رسائل حالياً";

    messages.appendChild(
        empty
    );

}


/* =========================================================
   Realtime
   ========================================================= */

function startRealtime() {

    if (!supabaseReady) {

        return;

    }


    if (realtimeChannel) {

        return;

    }


    try {

        realtimeChannel =
            supabaseClient
                .channel(
                    "emden-messages-realtime"
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "messages"
                    },
                    function (payload) {

                        console.log(
                            "رسالة جديدة:",
                            payload
                        );


                        if (
                            payload &&
                            payload.new &&
                            payload.new.encoded_text
                        ) {

                            addMessageToPager(
                                payload.new.encoded_text,
                                true
                            );

                        }

                    }
                )
                .subscribe(
                    function (status) {

                        console.log(
                            "Realtime:",
                            status
                        );

                    }
                );

    }

    catch (error) {

        console.log(
            "Realtime error:",
            error
        );

    }

}


/* =========================================================
   إضافة رسالة للواجهة
   ========================================================= */

function addMessageToPager(
    encoded,
    scrollToMessage
) {

    var messages =
        document.getElementById(
            "messages"
        );


    if (!messages) {

        return;

    }


    var empty =
        messages.querySelector(
            ".empty"
        );


    if (empty) {

        empty.remove();

    }


    /*
       منع تكرار الرسالة
       إذا كانت موجودة بالفعل
    */

    var existing =
        messages.querySelectorAll(
            ".message"
        );


    for (
        var i = 0;
        i < existing.length;
        i++
    ) {

        var numberElement =
            existing[i].querySelector(
                ".message-numbers"
            );


        if (
            numberElement &&
            numberElement.textContent === encoded
        ) {

            /*
              لا نحذف الرسائل المتشابهة من قاعدة البيانات.
              فقط نسمح بوجودها إذا كانت رسالة جديدة فعلًا.
            */

        }

    }


    var messageBox =
        document.createElement(
            "div"
        );

    messageBox.className =
        "message";


    /* الأرقام */

    var numbers =
        document.createElement(
            "div"
        );

    numbers.className =
        "message-numbers";

    numbers.textContent =
        encoded;


    /* زر النسخ */

    var copyButton =
        document.createElement(
            "button"
        );

    copyButton.className =
        "copy";

    copyButton.type =
        "button";

    copyButton.textContent =
        "نسخ الأرقام";


    copyButton.addEventListener(
        "click",
        function () {

            copyText(
                encoded,
                copyButton
            );

        }
    );


    /* زر فك الشفرة PS5 */

    var ps5DecodeButton =
        document.createElement(
            "button"
        );

    ps5DecodeButton.className =
        "copy";

    ps5DecodeButton.type =
        "button";

    ps5DecodeButton.textContent =
        "🎮 فك الشفرة";


    ps5DecodeButton.addEventListener(
        "click",
        function () {

            openPS5MessageDecode(
                encoded
            );

        }
    );


    messageBox.appendChild(
        numbers
    );

    messageBox.appendChild(
        copyButton
    );

    messageBox.appendChild(
        ps5DecodeButton
    );


    messages.prepend(
        messageBox
    );


    if (scrollToMessage) {

        try {

            messageBox.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }

        catch (error) {}

    }

}


/* =========================================================
   فك رسالة PS5 مباشرة
   ========================================================= */

function openPS5MessageDecode(encoded) {

    mode =
        "ps5Decode";

    enteredCode =
        "";

    codeDisplay.textContent =
        "";

    codeStep.classList.remove(
        "hidden"
    );

    sendStep.classList.add(
        "hidden"
    );

    decodeStep.classList.add(
        "hidden"
    );


    modalTitle.textContent =
        "🎮 فك شفرة الرسالة";


    /*
       نحفظ الرسالة التي ضغط عليها اللاعب
       حتى نعرضها مباشرة بعد إدخال 5567
    */

    window.selectedPS5Message =
        encoded;


    modal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   بعد إدخال 5567
   ========================================================= */

var originalCheckCode =
    checkCode;


/*
   نعدل التحقق لفك رسالة PS5
*/

checkCode = function () {

    if (
        mode !== "ps5Decode"
    ) {

        originalCheckCode();

        return;

    }


    if (
        enteredCode !== PS5_DECODE_CODE
    ) {

        alert(
            "الرمز غير صحيح"
        );

        enteredCode = "";

        codeDisplay.textContent =
            "";

        return;

    }


    codeStep.classList.add(
        "hidden"
    );


    decodeStep.classList.remove(
        "hidden"
    );


    var numberInput =
        document.getElementById(
            "numberInput"
        );


    var decodeResult =
        document.getElementById(
            "decodeResult"
        );


    if (numberInput) {

        numberInput.value =
            window.selectedPS5Message || "";

    }


    if (decodeResult) {

        decodeResult.textContent =
            decodeMessage(
            
