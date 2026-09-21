"use strict";

// ===============================
// EMDEN PAGER
// الجوال + PS5
// ===============================


// ===============================
// العناصر
// ===============================

var warning = document.getElementById("warning");
var agreeBtn = document.getElementById("agreeBtn");
var timerEl = document.getElementById("timer");

var modal = document.getElementById("modal");
var modalTitle = document.getElementById("modalTitle");

var codeStep = document.getElementById("codeStep");
var sendStep = document.getElementById("sendStep");
var decodeStep = document.getElementById("decodeStep");
var ps5Step = document.getElementById("ps5Step");

var codeDisplay = document.getElementById("codeDisplay");
var keypad = document.getElementById("keypad");

var enteredCode = "";
var mode = "";

var cooldownRunning = false;


// ===============================
// أكواد الدخول
// ===============================

var NORMAL_SEND_CODE = "1889";
var NORMAL_DECODE_CODE = "1900";

var PS5_CODE = "5576";
var PS5_DECODE_CODE = "5567";


// ===============================
// SUPABASE
// ===============================

var SUPABASE_URL =
    "https://hmwnhwfjffkxmufripok.supabase.co";

var SUPABASE_KEY =
    "sb_publishable_YdLIkiNahtrG0AFSX7iVVA__nYrwICs";

var supabaseClient = null;
var pagerChannel = null;
var pagerConnected = false;


// ===============================
// تشغيل Supabase
// ===============================

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

        pagerChannel =
            supabaseClient.channel("emden-pager");

        pagerChannel
            .on(
                "broadcast",
                { event: "pager_message" },
                function (data) {

                    if (
                        data &&
                        data.payload &&
                        data.payload.encoded
                    ) {

                        addMessageToPager(
                            data.payload.encoded
                        );

                    }

                }
            )
            .subscribe(function (status) {

                if (status === "SUBSCRIBED") {

                    pagerConnected = true;

                    console.log(
                        "Emden Pager: Connected"
                    );

                }

            });

    }

} catch (error) {

    console.log(
        "Supabase Error:",
        error
    );

}


// ===============================
// إخفاء الرموز من الأزرار
// ===============================

var actionSmall =
    document.querySelectorAll(
        ".actions small"
    );

for (
    var a = 0;
    a < actionSmall.length;
    a++
) {

    if (a < 2) {

        actionSmall[a].textContent =
            "رمز الدخول: ••••";

    }

}


// ===============================
// عداد الموافقة
// ===============================

var seconds = 5;

var countdown =
    setInterval(function () {

        seconds--;

        if (seconds <= 0) {

            clearInterval(countdown);

            agreeBtn.disabled = false;
            agreeBtn.style.pointerEvents = "auto";
            agreeBtn.style.opacity = "1";

            timerEl.textContent = "";

        } else {

            timerEl.textContent = seconds;

        }

    }, 1000);


// ===============================
// موافق
// ===============================

agreeBtn.addEventListener(
    "click",
    function () {

        warning.classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");

    }
);


// ===============================
// فتح النظام
// ===============================

function openModal(type, messageToDecode) {

    mode = type;

    enteredCode = "";

    codeDisplay.textContent = "";

    codeStep.classList.remove("hidden");

    sendStep.classList.add("hidden");
    decodeStep.classList.add("hidden");
    ps5Step.classList.add("hidden");

    document.getElementById("codeText").textContent =
        "أدخل رمز الدخول من لوحة الأرقام";

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

    else if (type === "ps5MessageDecode") {

        modalTitle.textContent =
            "🔓 فك شفرة الرسالة";

        document.getElementById("codeText").textContent =
            "أدخل رمز فك الشفرة";

        window.ps5DecodeTarget =
            messageToDecode || "";

    }

    modal.classList.remove("hidden");

}


// ===============================
// إرسال عادي
// ===============================

document
    .getElementById("sendOpen")
    .addEventListener(
        "click",
        function () {

            openModal("send");

        }
    );


// ===============================
// فك الشفرة العادي
// ===============================

document
    .getElementById("decodeOpen")
    .addEventListener(
        "click",
        function () {

            openModal("decode");

        }
    );


// ===============================
// نظام PS5
// ===============================

document
    .getElementById("ps5Open")
    .addEventListener(
        "click",
        function () {

            openModal("ps5");

        }
    );


// ===============================
// إغلاق
// ===============================

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        function () {

            modal.classList.add("hidden");

            enteredCode = "";

            codeDisplay.textContent = "";

        }
    );


// ===============================
// لوحة الأرقام
// ===============================

function createKey(number) {

    var button =
        document.createElement("button");

    button.type = "button";

    button.textContent = number;

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

    keypad.appendChild(button);

}


for (
    var k = 1;
    k <= 9;
    k++
) {

    createKey(k);

}

createKey(0);


// ===============================
// مسح
// ===============================

document
    .getElementById("clearCode")
    .addEventListener(
        "click",
        function () {

            enteredCode = "";

            codeDisplay.textContent = "";

        }
    );


// ===============================
// التحقق من الأكواد
// ===============================

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

    else if (mode === "ps5MessageDecode") {

        correctCode =
            PS5_DECODE_CODE;

    }


    if (
        enteredCode !== correctCode
    ) {

        alert("الرمز غير صحيح");

        enteredCode = "";

        codeDisplay.textContent = "";

        return;

    }


    // ===========================
    // النظام العادي - إرسال
    // ===========================

    if (mode === "send") {

        codeStep.classList.add("hidden");

        sendStep.classList.remove("hidden");

    }


    // ===========================
    // النظام العادي - فك
    // ===========================

    else if (mode === "decode") {

        codeStep.classList.add("hidden");

        decodeStep.classList.remove("hidden");

    }


    // ===========================
    // PS5
    // ===========================

    else if (mode === "ps5") {

        codeStep.classList.add("hidden");

        ps5Step.classList.remove("hidden");

    }


    // ===========================
    // فك رسالة PS5
    // ===========================

    else if (mode === "ps5MessageDecode") {

        var target =
            window.ps5DecodeTarget || "";

        modal.classList.add("hidden");

        alert(
            decodeMessage(target)
        );

        window.ps5DecodeTarget = "";

    }

}


// ===============================
// الترميز
// ===============================

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


// ===============================
// عكس الترميز
// ===============================

var reverseAlphabet = {};

Object.keys(alphabet).forEach(
    function (letter) {

        reverseAlphabet[
            alphabet[letter]
        ] = letter;

    }
);


// ===============================
// عربي → أرقام
// ===============================

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

        } else {

            result += "??";

        }

    }

    return result;

}


// ===============================
// أرقام → عربي
// ===============================

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
        !/^\d+$/.test(cleanNumbers)
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

        } else {

            result += "؟";

        }

    }

    return result;

}


// ===============================
// إضافة الرسالة
// ===============================

function addMessageToPager(encoded) {

    var messages =
        document.getElementById(
            "messages"
        );

    var empty =
        messages.querySelector(
            ".empty"
        );

    if (empty) {

        empty.remove();

    }


    var messageBox =
        document.createElement("div");

    messageBox.className =
        "message";


    var numbers =
        document.createElement("div");

    numbers.textContent =
        encoded;


    // ===========================
    // زر النسخ
    // ===========================

    var copyButton =
        document.createElement("button");

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


    // ===========================
    // زر فك الشفرة
    // ===========================

    var decodeButton =
        document.createElement("button");

    decodeButton.className =
        "copy";

    decodeButton.type =
        "button";

    decodeButton.textContent =
        "🔓 فك الشفرة";


    decodeButton.addEventListener(
        "click",
        function () {

            openModal(
                "ps5MessageDecode",
                encoded
            );

        }
    );


    messageBox.appendChild(numbers);

    messageBox.appendChild(copyButton);

    messageBox.appendChild(decodeButton);

    messages.prepend(messageBox);

}


// ===============================
// النسخ
// ===============================

function copyText(text, button) {

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(text)
            .then(function () {

                button.textContent =
                    "تم النسخ ✓";

                setTimeout(
                    function () {

                        button.textContent =
                            "نسخ الأرقام";

                    },
                    1500
                );

            })
            .catch(function () {

                oldCopyMethod(
                    text,
                    button
                );

            });

        return;

    }

    oldCopyMethod(
        text,
        button
    );

}


// ===============================
// نسخ قديم
// ===============================

function oldCopyMethod(
    text,
    button
) {

    var textarea =
        document.createElement(
            "textarea"
        );

    textarea.value =
        text;

    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    document.body.appendChild(
        textarea
    );

    textarea.focus();

    textarea.select();

    try {

        document.execCommand(
            "copy"
        );

        button.textContent =
            "تم النسخ ✓";

        setTimeout(
            function () {

                button.textContent =
                    "نسخ الأرقام";

            },
            1500
        );

    } catch (error) {

        alert(
            "انسخ الأرقام يدويًا."
        );

    }

    document.body.removeChild(
        textarea
    );

}


// ===============================
// إرسال النظام العادي
// ===============================

document
    .getElementById("sendBtn")
    .addEventListener(
        "click",
        function () {

            sendPagerMessage(
                "messageInput"
            );

        }
    );


// ===============================
// إرسال PS5
// ===============================

document
    .getElementById("ps5SendBtn")
    .addEventListener(
        "click",
        function () {

            sendPagerMessage(
                "ps5MessageInput"
            );

        }
    );


// ===============================
// إرسال الرسالة
// ===============================

function sendPagerMessage(inputId) {

    if (cooldownRunning) {

        return;

    }


    var input =
        document.getElementById(
            inputId
        );

    var message =
        input.value.trim();


    if (!message) {

        alert(
            "اكتب الرسالة أولاً."
        );

        return;

    }


    if (
        !pagerConnected ||
        !pagerChannel
    ) {

        alert(
            "الاتصال بالسيرفر غير جاهز، حاول بعد ثواني."
        );

        return;

    }


    var encoded =
        encodeMessage(message);


    try {

        pagerChannel
            .send({

                type: "broadcast",

                event:
                    "pager_message",

                payload: {
                    encoded:
                        encoded
                }

            })
            .then(
                function (result) {

                    if (
                        result !== "ok"
                    ) {

                        console.log(result);

                        alert(
                            "تعذر إرسال الرسالة."
                        );

                        return;

                    }


                    input.value = "";

                    startCooldown();

                }
            )
            .catch(
                function (error) {

                    console.log(error);

                    alert(
                        "حدث خطأ أثناء إرسال الرسالة."
                    );

                }
            );

    } catch (error) {

        console.log(error);

        alert(
            "حدث خطأ أثناء إرسال الرسالة."
        );

    }

}


// ===============================
// مؤقت 20 ثانية
// ===============================

function startCooldown() {

    cooldownRunning = true;

    var cooldown =
        document.getElementById(
            "cooldown"
        );

    var remaining = 20;

    cooldown.textContent =
        "انتظر " +
        remaining +
        " ثانية قبل إرسال رسالة أخرى";


    var interval =
        setInterval(
            function () {

                remaining--;

                if (
                    remaining <= 0
                ) {

                    clearInterval(interval);

                    cooldownRunning = false;

                    cooldown.textContent =
                        "يمكنك إرسال رسالة جديدة.";

                } else {

                    cooldown.textContent =
                        "انتظر " +
                        remaining +
                        " ثانية قبل إرسال رسالة أخرى";

                }

            },
            1000
        );

}


// ===============================
// فك الشفرة العادي
// ===============================

document
    .getElementById("decodeBtn")
    .addEventListener(
        "click",
        function () {

            var numbers =
                document.getElementById(
                    "numberInput"
                ).value.trim();

            var result =
                decodeMessage(numbers);

            document.getElementById(
                "decodeResult"
            ).textContent =
                result;

        }
    );
